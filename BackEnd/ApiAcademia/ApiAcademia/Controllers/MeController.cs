using System.Security.Claims;
using ApiAcademia.Application.Dtos;
using ApiAcademia.Application.Exceptions;
using ApiAcademia.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/me")]
[Authorize]
public sealed class MeController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet("purchases")]
    public async Task<CustomerPurchasesResponse> Purchases(CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new AppException("Token invalido.", StatusCodes.Status401Unauthorized);
        }

        var subscriptions = await dbContext.Subscriptions
            .AsNoTracking()
            .Include(x => x.Plan)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.StartsAt)
            .Select(x => new CustomerSubscriptionPurchaseRow(
                x.Id,
                x.Plan!.Name,
                x.FinalAmount,
                x.Status,
                x.PaymentPreferenceId,
                x.StartsAt,
                x.EndsAt))
            .ToListAsync(cancellationToken);

        var products = await dbContext.ProductPurchases
            .AsNoTracking()
            .Include(x => x.Product)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CustomerProductPurchaseRow(
                x.Id,
                x.Product!.Name,
                x.Quantity,
                x.TotalAmount,
                x.Status,
                x.PaymentPreferenceId,
                x.CreatedAt))
            .ToListAsync(cancellationToken);

        var allAmounts = subscriptions.Sum(x => x.FinalAmount) + products.Sum(x => x.TotalAmount);
        var pending = subscriptions.Count(x => x.Status == "Pending") + products.Count(x => x.Status == "Pending");
        var paid = subscriptions.Count(x => x.Status == "Paid") + products.Count(x => x.Status == "Paid");

        return new CustomerPurchasesResponse(
            new CustomerPurchaseSummary(subscriptions.Count + products.Count, pending, paid, allAmounts),
            subscriptions,
            products);
    }
}
