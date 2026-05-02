using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Domain.Entities;

public sealed class Plan
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 999999.99)]
    public decimal Price { get; set; }

    [Range(1, 36)]
    public int DurationMonths { get; set; }

    public bool Active { get; set; } = true;

    public ICollection<Subscription> Subscriptions { get; set; } = [];
}
