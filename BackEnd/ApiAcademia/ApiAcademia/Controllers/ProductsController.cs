using ApiAcademia.Api;
using ApiAcademia.Application.Dtos;
using ApiAcademia.Application.Exceptions;
using ApiAcademia.Application.Security;
using ApiAcademia.Domain.Entities;
using ApiAcademia.Domain.Repositories;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Policy = "AdminOnly")]
public sealed class ProductsController(
    IRepository<Product> productRepository,
    IInputSanitizer sanitizer) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<ProductResponse>> List(CancellationToken cancellationToken)
    {
        var products = await productRepository.ListAsync(cancellationToken);
        return products.Select(ToResponse).ToList();
    }

    [HttpGet("{id:guid}")]
    public async Task<ProductResponse> GetById(Guid id, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Produto nao encontrado.", StatusCodes.Status404NotFound);

        return ToResponse(product);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create(
        [FromForm] CreateProductRequest request,
        IValidator<CreateProductRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        var sku = request.Sku.Trim().ToUpperInvariant();
        if (await productRepository.FirstOrDefaultAsync(x => x.Sku == sku, cancellationToken) is not null)
        {
            throw new AppException("SKU ja cadastrado.");
        }

        var imageBytes = await ReadImageBytesAsync(request.Image!, cancellationToken);
        var product = new Product
        {
            Name = sanitizer.Clean(request.Name),
            Description = sanitizer.Clean(request.Description),
            Sku = sku,
            ImageData = imageBytes,
            ImageContentType = request.Image!.ContentType,
            ImageFileName = Path.GetFileName(request.Image.FileName),
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            Active = true
        };

        await productRepository.AddAsync(product, cancellationToken);
        await productRepository.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, ToResponse(product));
    }

    [HttpPut("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromForm] UpdateProductRequest request,
        IValidator<UpdateProductRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        var product = await productRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Produto nao encontrado.", StatusCodes.Status404NotFound);

        product.Name = sanitizer.Clean(request.Name);
        product.Description = sanitizer.Clean(request.Description);
        if (request.Image is not null)
        {
            product.ImageData = await ReadImageBytesAsync(request.Image, cancellationToken);
            product.ImageContentType = request.Image.ContentType;
            product.ImageFileName = Path.GetFileName(request.Image.FileName);
        }
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.Active = request.Active;
        product.UpdatedAt = DateTimeOffset.UtcNow;

        productRepository.Update(product);
        await productRepository.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(product));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Produto nao encontrado.", StatusCodes.Status404NotFound);

        product.Active = false;
        product.UpdatedAt = DateTimeOffset.UtcNow;
        productRepository.Update(product);
        await productRepository.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static ProductResponse ToResponse(Product product)
    {
        return new ProductResponse(
            product.Id,
            product.Name,
            product.Description,
            product.Sku,
            $"/api/catalog/products/{product.Id}/image",
            product.Price,
            product.StockQuantity,
            product.Active);
    }

    private static async Task<byte[]> ReadImageBytesAsync(IFormFile image, CancellationToken cancellationToken)
    {
        await using var stream = image.OpenReadStream();
        using var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream, cancellationToken);
        return memoryStream.ToArray();
    }
}
