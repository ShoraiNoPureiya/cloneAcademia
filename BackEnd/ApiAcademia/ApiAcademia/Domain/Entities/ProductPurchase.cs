using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Domain.Entities;

public sealed class ProductPurchase
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    public User? User { get; set; }

    [Required]
    public Guid ProductId { get; set; }

    public Product? Product { get; set; }

    [Range(1, 999999)]
    public int Quantity { get; set; }

    [Range(0.01, 999999.99)]
    public decimal UnitPrice { get; set; }

    [Range(0.01, 999999.99)]
    public decimal TotalAmount { get; set; }

    [Required, MaxLength(40)]
    public string Status { get; set; } = "Pending";

    [MaxLength(120)]
    public string? PaymentPreferenceId { get; set; }

    public CustomerInfo CustomerInfo { get; set; } = new();

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
