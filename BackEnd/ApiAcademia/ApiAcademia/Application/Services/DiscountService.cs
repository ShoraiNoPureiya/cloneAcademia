using ApiAcademia.Application.Exceptions;
using ApiAcademia.Domain.Entities;
using ApiAcademia.Domain.Repositories;

namespace ApiAcademia.Application.Services;

public interface IDiscountService
{
    Task<DiscountResult> CalculateAsync(Plan plan, string? couponCode, CancellationToken cancellationToken);
    Task<DiscountResult> CalculateAsync(decimal originalAmount, string? couponCode, string itemName, CancellationToken cancellationToken);
}

public sealed record DiscountResult(Coupon? Coupon, decimal OriginalAmount, decimal DiscountAmount, decimal FinalAmount);

public sealed class DiscountService(IRepository<Coupon> couponRepository) : IDiscountService
{
    public async Task<DiscountResult> CalculateAsync(Plan plan, string? couponCode, CancellationToken cancellationToken)
    {
        return await CalculateAsync(plan.Price, couponCode, "plano", cancellationToken);
    }

    public async Task<DiscountResult> CalculateAsync(decimal originalAmount, string? couponCode, string itemName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(couponCode))
        {
            return new DiscountResult(null, originalAmount, 0, originalAmount);
        }

        var normalizedCode = couponCode.Trim().ToUpperInvariant();
        var coupon = await couponRepository.FirstOrDefaultAsync(x => x.Code == normalizedCode, cancellationToken)
            ?? throw new AppException("Cupom invalido.");

        if (!coupon.Active)
        {
            throw new AppException("Cupom inativo.");
        }

        if (coupon.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            throw new AppException("Cupom expirado.");
        }

        if (coupon.DiscountAmount > originalAmount)
        {
            throw new AppException($"Desconto do cupom excede o valor do {itemName}.");
        }

        var finalAmount = originalAmount - coupon.DiscountAmount;
        return new DiscountResult(coupon, originalAmount, coupon.DiscountAmount, finalAmount);
    }
}
