using ApiAcademia.Application.Dtos;
using ApiAcademia.Application.Exceptions;
using ApiAcademia.Application.Security;
using ApiAcademia.Domain.Entities;
using ApiAcademia.Domain.Repositories;
using Microsoft.AspNetCore.Identity;

namespace ApiAcademia.Application.Services;

public interface IAuthService
{
    Task RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<object> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthResponse> VerifyTwoFactorAsync(VerifyTwoFactorRequest request, CancellationToken cancellationToken);
    Task ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken);
    Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken);
    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}

public sealed class AuthService(
    IRepository<User> userRepository,
    IPasswordHasher<User> passwordHasher,
    IJwtTokenService jwtTokenService,
    ISecureTokenGenerator tokenGenerator,
    ITokenHasher tokenHasher,
    IInputSanitizer sanitizer,
    IEmailSender emailSender,
    IConfiguration configuration) : IAuthService
{
    public async Task RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await userRepository.FirstOrDefaultAsync(x => x.Email == email, cancellationToken) is not null)
        {
            throw new AppException("Nao foi possivel concluir o cadastro.");
        }

        var requireEmailConfirmation = configuration.GetValue("Auth:RequireEmailConfirmation", false);
        var requireTwoFactor = configuration.GetValue("Auth:RequireTwoFactor", false);
        var token = requireEmailConfirmation ? tokenGenerator.GenerateToken() : null;
        var user = new User
        {
            Name = sanitizer.Clean(request.Name),
            Email = email,
            Role = "Member",
            EmailConfirmed = !requireEmailConfirmation,
            TwoFactorEnabled = requireTwoFactor,
            EmailConfirmationTokenHash = token is null ? null : tokenHasher.Hash(token),
            EmailConfirmationTokenExpiresAt = token is null ? null : DateTimeOffset.UtcNow.AddHours(24)
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        await userRepository.AddAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        if (requireEmailConfirmation && token is not null)
        {
            await emailSender.SendAsync(
                user.Email,
                "Confirme seu email - PulseFit",
                BuildEmailConfirmationBody(user.Name, token),
                cancellationToken);
        }
    }

    public async Task<object> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await GetUserOrInvalidCredentialsAsync(request.Email, cancellationToken);
        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            throw new AppException("Credenciais invalidas.", StatusCodes.Status401Unauthorized);
        }

        if (configuration.GetValue("Auth:RequireEmailConfirmation", false) && !user.EmailConfirmed)
        {
            throw new AppException("Confirme seu email antes de entrar.", StatusCodes.Status403Forbidden);
        }

        if (configuration.GetValue("Auth:RequireTwoFactor", false) && user.TwoFactorEnabled)
        {
            var code = tokenGenerator.GenerateNumericCode();
            user.TwoFactorCodeHash = tokenHasher.Hash(code);
            user.TwoFactorCodeExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5);
            userRepository.Update(user);
        await userRepository.SaveChangesAsync(cancellationToken);
        await emailSender.SendAsync(
            user.Email,
            "Codigo de autenticacao - PulseFit",
            BuildTwoFactorBody(code),
            cancellationToken);
            return new PendingAuthResponse(true, "Codigo de autenticacao enviado.");
        }

        return ToResponse(jwtTokenService.Create(user));
    }

    public async Task<AuthResponse> VerifyTwoFactorAsync(VerifyTwoFactorRequest request, CancellationToken cancellationToken)
    {
        var user = await GetUserOrInvalidCredentialsAsync(request.Email, cancellationToken);
        if (user.TwoFactorCodeExpiresAt <= DateTimeOffset.UtcNow ||
            string.IsNullOrWhiteSpace(user.TwoFactorCodeHash) ||
            user.TwoFactorCodeHash != tokenHasher.Hash(request.Code))
        {
            throw new AppException("Codigo invalido ou expirado.", StatusCodes.Status401Unauthorized);
        }

        user.TwoFactorCodeHash = null;
        user.TwoFactorCodeExpiresAt = null;
        userRepository.Update(user);
        await userRepository.SaveChangesAsync(cancellationToken);
        return ToResponse(jwtTokenService.Create(user));
    }

    public async Task ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken)
    {
        var user = await GetUserOrInvalidCredentialsAsync(request.Email, cancellationToken);
        if (user.EmailConfirmationTokenExpiresAt <= DateTimeOffset.UtcNow ||
            user.EmailConfirmationTokenHash != tokenHasher.Hash(request.Token))
        {
            throw new AppException("Token invalido ou expirado.");
        }

        user.EmailConfirmed = true;
        user.EmailConfirmationTokenHash = null;
        user.EmailConfirmationTokenExpiresAt = null;
        userRepository.Update(user);
        await userRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await userRepository.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (user is null)
        {
            return;
        }

        var token = tokenGenerator.GenerateToken();
        user.PasswordResetTokenHash = tokenHasher.Hash(token);
        user.PasswordResetTokenExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30);
        userRepository.Update(user);
        await userRepository.SaveChangesAsync(cancellationToken);
        await emailSender.SendAsync(
            user.Email,
            "Redefinicao de senha - PulseFit",
            BuildPasswordResetBody(token),
            cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await GetUserOrInvalidCredentialsAsync(request.Email, cancellationToken);
        if (user.PasswordResetTokenExpiresAt <= DateTimeOffset.UtcNow ||
            user.PasswordResetTokenHash != tokenHasher.Hash(request.Token))
        {
            throw new AppException("Token invalido ou expirado.");
        }

        user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiresAt = null;
        userRepository.Update(user);
        await userRepository.SaveChangesAsync(cancellationToken);
    }

    private async Task<User> GetUserOrInvalidCredentialsAsync(string email, CancellationToken cancellationToken)
    {
        return await userRepository.FirstOrDefaultAsync(x => x.Email == email.Trim().ToLowerInvariant(), cancellationToken)
            ?? throw new AppException("Credenciais invalidas.", StatusCodes.Status401Unauthorized);
    }

    private static AuthResponse ToResponse(AuthToken token) => new(token.AccessToken, token.ExpiresAt);

    private static string BuildEmailConfirmationBody(string name, string token)
    {
        return $"""
            <h2>Confirme seu email, {name}</h2>
            <p>Use o codigo abaixo para confirmar sua conta na PulseFit:</p>
            <p style="font-size:20px;font-weight:700;letter-spacing:2px;">{token}</p>
            <p>Esse codigo expira em 24 horas.</p>
            """;
    }

    private static string BuildTwoFactorBody(string code)
    {
        return $"""
            <h2>Codigo de autenticacao</h2>
            <p>Use o codigo abaixo para concluir seu login:</p>
            <p style="font-size:28px;font-weight:700;letter-spacing:4px;">{code}</p>
            <p>Esse codigo expira em 5 minutos.</p>
            """;
    }

    private static string BuildPasswordResetBody(string token)
    {
        return $"""
            <h2>Redefinicao de senha</h2>
            <p>Use o token abaixo para redefinir sua senha:</p>
            <p style="font-size:20px;font-weight:700;letter-spacing:2px;">{token}</p>
            <p>Esse token expira em 30 minutos.</p>
            """;
    }
}
