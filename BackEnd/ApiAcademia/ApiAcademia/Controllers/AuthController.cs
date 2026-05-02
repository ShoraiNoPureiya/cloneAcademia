using ApiAcademia.Api;
using ApiAcademia.Application.Dtos;
using ApiAcademia.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterRequest request,
        IValidator<RegisterRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        await authService.RegisterAsync(request, cancellationToken);
        return Accepted(new { message = "Cadastro criado. Confirme seu email para acessar." });
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(
        LoginRequest request,
        IValidator<LoginRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        return Ok(await authService.LoginAsync(request, cancellationToken));
    }

    [HttpPost("2fa/verify")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> VerifyTwoFactor(
        VerifyTwoFactorRequest request,
        IValidator<VerifyTwoFactorRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        return Ok(await authService.VerifyTwoFactorAsync(request, cancellationToken));
    }

    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(
        ConfirmEmailRequest request,
        IValidator<ConfirmEmailRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        await authService.ConfirmEmailAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordRequest request,
        IValidator<ForgotPasswordRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        await authService.ForgotPasswordAsync(request, cancellationToken);
        return Accepted(new { message = "Se o email existir, enviaremos instrucoes de redefinicao." });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> ResetPassword(
        ResetPasswordRequest request,
        IValidator<ResetPasswordRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        await authService.ResetPasswordAsync(request, cancellationToken);
        return NoContent();
    }
}
