namespace ApiAcademia.Application.Dtos;

public sealed record RegisterRequest(string Name, string Email, string Password);

public sealed record LoginRequest(string Email, string Password);

public sealed record VerifyTwoFactorRequest(string Email, string Code);

public sealed record ConfirmEmailRequest(string Email, string Token);

public sealed record ForgotPasswordRequest(string Email);

public sealed record ResetPasswordRequest(string Email, string Token, string NewPassword);

public sealed record AuthResponse(string AccessToken, DateTimeOffset ExpiresAt);

public sealed record PendingAuthResponse(bool RequiresTwoFactor, string Message);
