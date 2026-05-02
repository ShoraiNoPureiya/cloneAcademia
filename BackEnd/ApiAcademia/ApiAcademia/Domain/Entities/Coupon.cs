using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Domain.Entities;

public sealed class Coupon
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(40)]
    public string Code { get; set; } = string.Empty;

    [Range(0.01, 999999.99)]
    public decimal DiscountAmount { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public bool Active { get; set; } = true;

    public ICollection<Subscription> Subscriptions { get; set; } = [];
}
