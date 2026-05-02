using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Domain.Entities;

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(180)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(512)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(40)]
    public string Role { get; set; } = "Member";

    public bool EmailConfirmed { get; set; }

    public bool TwoFactorEnabled { get; set; } = true;

    [MaxLength(256)]
    public string? EmailConfirmationTokenHash { get; set; }

    public DateTimeOffset? EmailConfirmationTokenExpiresAt { get; set; }

    [MaxLength(256)]
    public string? PasswordResetTokenHash { get; set; }

    public DateTimeOffset? PasswordResetTokenExpiresAt { get; set; }

    [MaxLength(256)]
    public string? TwoFactorCodeHash { get; set; }

    public DateTimeOffset? TwoFactorCodeExpiresAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Subscription> Subscriptions { get; set; } = [];
}
