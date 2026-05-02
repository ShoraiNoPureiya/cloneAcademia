using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Domain.Entities;

public sealed class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(60)]
    public string Sku { get; set; } = string.Empty;

    [Required]
    public byte[] ImageData { get; set; } = [];

    [Required, MaxLength(100)]
    public string ImageContentType { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string ImageFileName { get; set; } = string.Empty;

    [Range(0.01, 999999.99)]
    public decimal Price { get; set; }

    [Range(0, 999999)]
    public int StockQuantity { get; set; }

    public bool Active { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? UpdatedAt { get; set; }
}
