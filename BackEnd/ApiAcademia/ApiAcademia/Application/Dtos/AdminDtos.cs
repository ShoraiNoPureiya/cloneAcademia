namespace ApiAcademia.Application.Dtos;

public sealed record AdminDashboardSummary(
    int TotalSubscriptions,
    decimal SubscriptionRevenue,
    int ProductPurchases,
    decimal ProductRevenue,
    int ActiveProducts,
    int ActiveCoupons);

public sealed record AdminSubscriptionRow(
    Guid Id,
    string UserName,
    string UserEmail,
    string PlanName,
    string? CouponCode,
    string CustomerFullName,
    string CustomerCpf,
    string CustomerZipCode,
    string CustomerAddress,
    string CustomerCity,
    string CustomerState,
    decimal FinalAmount,
    string Status,
    DateTimeOffset StartsAt);

public sealed record AdminProductPurchaseRow(
    Guid Id,
    string UserName,
    string UserEmail,
    string ProductName,
    string? CouponCode,
    int Quantity,
    string CustomerFullName,
    string CustomerCpf,
    string CustomerZipCode,
    string CustomerAddress,
    string CustomerCity,
    string CustomerState,
    string FulfillmentType,
    decimal OriginalAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    string Status,
    DateTimeOffset CreatedAt);

public sealed record AdminDashboardResponse(
    AdminDashboardSummary Summary,
    IReadOnlyList<AdminSubscriptionRow> RecentSubscriptions,
    IReadOnlyList<AdminProductPurchaseRow> RecentProductPurchases);

public sealed record CreateProductPurchaseRequest(int Quantity, string FulfillmentType, CustomerInfoRequest CustomerInfo, string? CouponCode);
public sealed record ProductPurchaseResponse(
    Guid Id,
    Guid ProductId,
    int Quantity,
    decimal OriginalAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    string Status,
    string PreferenceId,
    string CheckoutUrl);
