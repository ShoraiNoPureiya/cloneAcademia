using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ApiAcademia.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace ApiAcademia.Application.Services;

public interface IJwtTokenService
{
    AuthToken Create(User user);
}

public sealed record AuthToken(string AccessToken, DateTimeOffset ExpiresAt);

public sealed class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    public AuthToken Create(User user)
    {
        var issuer = configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer nao configurado.");
        var audience = configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience nao configurado.");
        var secret = configuration["Jwt:SigningKey"] ?? throw new InvalidOperationException("Jwt:SigningKey nao configurado.");

        if (Encoding.UTF8.GetByteCount(secret) < 32)
        {
            throw new InvalidOperationException("Jwt:SigningKey deve ter no minimo 256 bits.");
        }

        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(configuration.GetValue("Jwt:ExpiresMinutes", 60));
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new("email_confirmed", user.EmailConfirmed.ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        return new AuthToken(new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
