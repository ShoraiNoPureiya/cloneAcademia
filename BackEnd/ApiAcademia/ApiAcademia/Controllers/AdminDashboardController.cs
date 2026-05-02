using ApiAcademia.Application.Dtos;
using ApiAcademia.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Policy = "AdminOnly")]
public sealed class AdminDashboardController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<AdminDashboardResponse> Get(CancellationToken cancellationToken)
    {
        var totalSubscriptions = await dbContext.Subscriptions.CountAsync(cancellationToken);
        var subscriptionRevenue = await dbContext.Subscriptions
            .Where(x => x.Status == "Paid")
            .SumAsync(x => x.FinalAmount, cancellationToken);

        var productPurchases = await dbContext.ProductPurchases.CountAsync(cancellationToken);
        var productRevenue = await dbContext.ProductPurchases
            .Where(x => x.Status == "Paid")
            .SumAsync(x => x.TotalAmount, cancellationToken);

        var activeProducts = await dbContext.Products.CountAsync(x => x.Active, cancellationToken);
        var activeCoupons = await dbContext.Coupons.CountAsync(x => x.Active && x.ExpiresAt > DateTimeOffset.UtcNow, cancellationToken);

        var recentSubscriptions = await dbContext.Subscriptions
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Plan)
            .Include(x => x.Coupon)
            .OrderByDescending(x => x.StartsAt)
            .Take(8)
            .Select(x => new AdminSubscriptionRow(
                x.Id,
                x.User!.Name,
                x.User.Email,
                x.Plan!.Name,
                x.Coupon != null ? x.Coupon.Code : null,
                x.CustomerInfo.FullName,
                x.CustomerInfo.Cpf,
                x.CustomerInfo.ZipCode,
                x.CustomerInfo.Address,
                x.FinalAmount,
                x.Status,
                x.StartsAt))
            .ToListAsync(cancellationToken);

        var recentProductPurchases = await dbContext.ProductPurchases
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Product)
            .OrderByDescending(x => x.CreatedAt)
            .Take(8)
            .Select(x => new AdminProductPurchaseRow(
                x.Id,
                x.User!.Name,
                x.User.Email,
                x.Product!.Name,
                x.Quantity,
                x.CustomerInfo.FullName,
                x.CustomerInfo.Cpf,
                x.CustomerInfo.ZipCode,
                x.CustomerInfo.Address,
                x.TotalAmount,
                x.Status,
                x.CreatedAt))
            .ToListAsync(cancellationToken);

        var summary = new AdminDashboardSummary(
            totalSubscriptions,
            subscriptionRevenue,
            productPurchases,
            productRevenue,
            activeProducts,
            activeCoupons);

        return new AdminDashboardResponse(summary, recentSubscriptions, recentProductPurchases);
    }
}
