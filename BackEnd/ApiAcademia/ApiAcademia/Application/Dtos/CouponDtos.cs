namespace ApiAcademia.Application.Dtos;

public sealed record CreateCouponRequest(string Code, decimal DiscountAmount, DateTimeOffset ExpiresAt);

public sealed record CouponResponse(Guid Id, string Code, decimal DiscountAmount, DateTimeOffset ExpiresAt, bool Active);
