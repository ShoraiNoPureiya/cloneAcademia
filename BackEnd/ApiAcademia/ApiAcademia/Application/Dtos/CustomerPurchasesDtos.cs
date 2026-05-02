namespace ApiAcademia.Application.Dtos;

public sealed record CustomerPurchaseSummary(
    int TotalItems,
    int PendingItems,
    int PaidItems,
    decimal TotalAmount);

public sealed record CustomerSubscriptionPurchaseRow(
    Guid Id,
    string PlanName,
    decimal FinalAmount,
    string Status,
    string? PaymentPreferenceId,
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt);

public sealed record CustomerProductPurchaseRow(
    Guid Id,
    string ProductName,
    int Quantity,
    decimal TotalAmount,
    string Status,
    string? PaymentPreferenceId,
    DateTimeOffset CreatedAt);

public sealed record CustomerPurchasesResponse(
    CustomerPurchaseSummary Summary,
    IReadOnlyList<CustomerSubscriptionPurchaseRow> Subscriptions,
    IReadOnlyList<CustomerProductPurchaseRow> Products);
