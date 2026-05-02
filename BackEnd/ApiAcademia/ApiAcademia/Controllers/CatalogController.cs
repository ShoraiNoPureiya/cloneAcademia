using ApiAcademia.Application.Dtos;
using ApiAcademia.Domain.Entities;
using ApiAcademia.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/catalog")]
public sealed class CatalogController(
    IRepository<Plan> planRepository,
    IRepository<Product> productRepository) : ControllerBase
{
    [HttpGet("plans")]
    public async Task<IReadOnlyList<PlanResponse>> ListPlans(CancellationToken cancellationToken)
    {
        var plans = await planRepository.ListAsync(cancellationToken);
        return plans
            .Where(x => x.Active)
            .Select(x => new PlanResponse(x.Id, x.Name, x.Description, x.Price, x.DurationMonths, x.Active))
            .ToList();
    }

    [HttpGet("products")]
    public async Task<IReadOnlyList<ProductResponse>> ListProducts(CancellationToken cancellationToken)
    {
        var products = await productRepository.ListAsync(cancellationToken);
        return products
            .Where(x => x.Active)
            .Select(x => new ProductResponse(x.Id, x.Name, x.Description, x.Sku, $"/api/catalog/products/{x.Id}/image", x.Price, x.StockQuantity, x.Active))
            .ToList();
    }

    [HttpGet("products/{id:guid}/image")]
    public async Task<IActionResult> GetProductImage(Guid id, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken);
        if (product is null || product.ImageData.Length == 0)
        {
            return NotFound();
        }

        return File(product.ImageData, product.ImageContentType);
    }
}
