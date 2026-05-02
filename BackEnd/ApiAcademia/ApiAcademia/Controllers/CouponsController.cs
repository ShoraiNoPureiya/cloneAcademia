using ApiAcademia.Api;
using ApiAcademia.Application.Dtos;
using ApiAcademia.Domain.Entities;
using ApiAcademia.Domain.Repositories;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/admin/coupons")]
[Authorize(Policy = "AdminOnly")]
public sealed class CouponsController(IRepository<Coupon> couponRepository) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<CouponResponse>> List(CancellationToken cancellationToken)
    {
        var coupons = await couponRepository.ListAsync(cancellationToken);
        return coupons.Select(x => new CouponResponse(x.Id, x.Code, x.DiscountAmount, x.ExpiresAt, x.Active)).ToList();
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateCouponRequest request,
        IValidator<CreateCouponRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        var coupon = new Coupon
        {
            Code = request.Code.Trim().ToUpperInvariant(),
            DiscountAmount = request.DiscountAmount,
            ExpiresAt = request.ExpiresAt,
            Active = true
        };

        await couponRepository.AddAsync(coupon, cancellationToken);
        await couponRepository.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(List), new { id = coupon.Id }, new CouponResponse(coupon.Id, coupon.Code, coupon.DiscountAmount, coupon.ExpiresAt, coupon.Active));
    }
}
