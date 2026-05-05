using System.Security.Claims;
using ApiAcademia.Api;
using ApiAcademia.Application.Dtos;
using ApiAcademia.Application.Exceptions;
using ApiAcademia.Application.Services;
using ApiAcademia.Domain.Entities;
using ApiAcademia.Domain.Repositories;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public sealed class ProductPurchasesController(
    IRepository<User> userRepository,
    IRepository<Product> productRepository,
    IRepository<ProductPurchase> purchaseRepository,
    IPaymentGateway paymentGateway) : ControllerBase
{
    [HttpPost("{id:guid}/purchase")]
    public async Task<IActionResult> Purchase(
        Guid id,
        CreateProductPurchaseRequest request,
        IValidator<CreateProductPurchaseRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new AppException("Token invalido.", StatusCodes.Status401Unauthorized);
        }

        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new AppException("Usuario nao encontrado.", StatusCodes.Status404NotFound);

        var product = await productRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Produto nao encontrado.", StatusCodes.Status404NotFound);

        if (!product.Active || product.StockQuantity < request.Quantity)
        {
            throw new AppException("Produto indisponivel.");
        }

        var fulfillmentType = string.Equals(request.FulfillmentType, "Pickup", StringComparison.OrdinalIgnoreCase)
            ? "Pickup"
            : "Delivery";

        var purchase = new ProductPurchase
        {
            UserId = userId,
            ProductId = product.Id,
            Quantity = request.Quantity,
            UnitPrice = product.Price,
            TotalAmount = product.Price * request.Quantity,
            Status = "Pending",
            FulfillmentType = fulfillmentType,
            CustomerInfo = new CustomerInfo
            {
                FullName = request.CustomerInfo.FullName.Trim(),
                Cpf = OnlyDigits(request.CustomerInfo.Cpf),
                ZipCode = fulfillmentType == "Delivery" ? OnlyDigits(request.CustomerInfo.ZipCode ?? string.Empty) : string.Empty,
                Address = fulfillmentType == "Delivery" ? (request.CustomerInfo.Address ?? string.Empty).Trim() : "Retirada no local",
                City = fulfillmentType == "Delivery" ? (request.CustomerInfo.City ?? string.Empty).Trim() : string.Empty,
                State = fulfillmentType == "Delivery" ? (request.CustomerInfo.State ?? string.Empty).Trim().ToUpperInvariant() : string.Empty
            }
        };

        await purchaseRepository.AddAsync(purchase, cancellationToken);
        var preference = await paymentGateway.CreateProductPreferenceAsync(purchase, product, user, cancellationToken);
        purchase.PaymentPreferenceId = preference.Id;
        await purchaseRepository.SaveChangesAsync(cancellationToken);

        return Ok(new ProductPurchaseResponse(
            purchase.Id,
            product.Id,
            purchase.Quantity,
            purchase.TotalAmount,
            purchase.Status,
            preference.Id,
            preference.CheckoutUrl));
    }

    private static string OnlyDigits(string value) => new(value.Where(char.IsDigit).ToArray());
}
