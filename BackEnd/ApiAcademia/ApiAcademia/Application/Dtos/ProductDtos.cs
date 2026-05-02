namespace ApiAcademia.Application.Dtos;

public sealed class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public IFormFile? Image { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
}

public sealed class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IFormFile? Image { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool Active { get; set; }
}

public sealed record ProductResponse(
    Guid Id,
    string Name,
    string Description,
    string Sku,
    string ImageUrl,
    decimal Price,
    int StockQuantity,
    bool Active);
