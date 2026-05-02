namespace ApiAcademia.Application.Dtos;

public sealed record CustomerInfoRequest(string FullName, string Cpf, string ZipCode, string Address);

public sealed record CheckoutRequest(Guid PlanId, string? CouponCode, CustomerInfoRequest CustomerInfo);

public sealed record CheckoutResponse(
    Guid SubscriptionId,
    decimal OriginalAmount,
    decimal DiscountAmount,
    decimal FinalAmount,
    string PreferenceId,
    string CheckoutUrl);

public sealed record MercadoPagoWebhookRequest(string? Type, MercadoPagoWebhookData? Data);

public sealed record MercadoPagoWebhookData(string? Id);
