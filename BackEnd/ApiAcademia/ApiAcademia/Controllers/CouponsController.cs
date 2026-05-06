using ApiAcademia.Api;
using ApiAcademia.Application.Dtos;
using ApiAcademia.Application.Exceptions;
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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateCouponRequest request,
        IValidator<UpdateCouponRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        var coupon = await couponRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Cupom nao encontrado.", StatusCodes.Status404NotFound);

        var code = request.Code.Trim().ToUpperInvariant();
        var existing = await couponRepository.FirstOrDefaultAsync(x => x.Code == code && x.Id != id, cancellationToken);
        if (existing is not null)
        {
            throw new AppException("Codigo de cupom ja cadastrado.");
        }

        coupon.Code = code;
        coupon.DiscountAmount = request.DiscountAmount;
        coupon.ExpiresAt = request.ExpiresAt;
        coupon.Active = request.Active;

        couponRepository.Update(coupon);
        await couponRepository.SaveChangesAsync(cancellationToken);
        return Ok(new CouponResponse(coupon.Id, coupon.Code, coupon.DiscountAmount, coupon.ExpiresAt, coupon.Active));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var coupon = await couponRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Cupom nao encontrado.", StatusCodes.Status404NotFound);

        coupon.Active = false;
        couponRepository.Update(coupon);
        await couponRepository.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
