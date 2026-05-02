using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Domain.Entities;

public sealed class Subscription
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    public User? User { get; set; }

    [Required]
    public Guid PlanId { get; set; }

    public Plan? Plan { get; set; }

    public Guid? CouponId { get; set; }

    public Coupon? Coupon { get; set; }

    [Range(0.01, 999999.99)]
    public decimal OriginalAmount { get; set; }

    [Range(0, 999999.99)]
    public decimal DiscountAmount { get; set; }

    [Range(0.01, 999999.99)]
    public decimal FinalAmount { get; set; }

    [Required, MaxLength(40)]
    public string Status { get; set; } = "Pending";

    [MaxLength(120)]
    public string? PaymentPreferenceId { get; set; }

    public CustomerInfo CustomerInfo { get; set; } = new();

    public DateTimeOffset StartsAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? EndsAt { get; set; }
}
