using ApiAcademia.Application.Exceptions;
using ApiAcademia.Domain.Entities;
using ApiAcademia.Domain.Repositories;

namespace ApiAcademia.Application.Services;

public interface IDiscountService
{
    Task<DiscountResult> CalculateAsync(Plan plan, string? couponCode, CancellationToken cancellationToken);
}

public sealed record DiscountResult(Coupon? Coupon, decimal OriginalAmount, decimal DiscountAmount, decimal FinalAmount);

public sealed class DiscountService(IRepository<Coupon> couponRepository) : IDiscountService
{
    public async Task<DiscountResult> CalculateAsync(Plan plan, string? couponCode, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(couponCode))
        {
            return new DiscountResult(null, plan.Price, 0, plan.Price);
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

        if (coupon.DiscountAmount > plan.Price)
        {
            throw new AppException("Desconto do cupom excede o valor do plano.");
        }

        var finalAmount = plan.Price - coupon.DiscountAmount;
        return new DiscountResult(coupon, plan.Price, coupon.DiscountAmount, finalAmount);
    }
}
