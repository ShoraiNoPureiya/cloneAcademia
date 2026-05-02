using ApiAcademia.Application.Dtos;
using ApiAcademia.Application.Exceptions;
using ApiAcademia.Domain.Entities;
using ApiAcademia.Domain.Repositories;
using ApiAcademia.Infrastructure.Data;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using Microsoft.EntityFrameworkCore;

namespace ApiAcademia.Application.Services;

public interface IPaymentGateway
{
    Task<PaymentPreference> CreatePreferenceAsync(Subscription subscription, Plan plan, User user, CancellationToken cancellationToken);
    Task<PaymentPreference> CreateProductPreferenceAsync(ProductPurchase purchase, Product product, User user, CancellationToken cancellationToken);
}

public sealed record PaymentPreference(string Id, string CheckoutUrl);

public interface IPaymentStatusService
{
    Task ProcessMercadoPagoPaymentAsync(long paymentId, CancellationToken cancellationToken);
}

public sealed class MercadoPagoPaymentGateway(IConfiguration configuration) : IPaymentGateway
{
    public async Task<PaymentPreference> CreatePreferenceAsync(Subscription subscription, Plan plan, User user, CancellationToken cancellationToken)
    {
        ConfigureMercadoPago();

        var request = new PreferenceRequest
        {
            ExternalReference = subscription.Id.ToString(),
            NotificationUrl = configuration["MercadoPago:NotificationUrl"],
            Items =
            [
                new PreferenceItemRequest
                {
                    Id = plan.Id.ToString(),
                    Title = plan.Name,
                    Quantity = 1,
                    CurrencyId = configuration["MercadoPago:CurrencyId"] ?? "BRL",
                    UnitPrice = subscription.FinalAmount
                }
            ],
            Payer = new PreferencePayerRequest
            {
                Email = user.Email,
                Name = user.Name
            }
        };

        var client = new PreferenceClient();
        var preference = await client.CreateAsync(request, cancellationToken: cancellationToken);
        var checkoutUrl = configuration.GetValue("MercadoPago:UseSandbox", true)
            ? preference.SandboxInitPoint
            : preference.InitPoint;

        if (string.IsNullOrWhiteSpace(preference.Id) || string.IsNullOrWhiteSpace(checkoutUrl))
        {
            throw new AppException("Falha ao gerar preferencia de pagamento.", StatusCodes.Status502BadGateway);
        }

        return new PaymentPreference(preference.Id, checkoutUrl);
    }

    public async Task<PaymentPreference> CreateProductPreferenceAsync(ProductPurchase purchase, Product product, User user, CancellationToken cancellationToken)
    {
        ConfigureMercadoPago();

        var request = new PreferenceRequest
        {
            ExternalReference = purchase.Id.ToString(),
            NotificationUrl = configuration["MercadoPago:NotificationUrl"],
            Items =
            [
                new PreferenceItemRequest
                {
                    Id = product.Id.ToString(),
                    Title = product.Name,
                    Quantity = purchase.Quantity,
                    CurrencyId = configuration["MercadoPago:CurrencyId"] ?? "BRL",
                    UnitPrice = purchase.UnitPrice
                }
            ],
            Payer = new PreferencePayerRequest
            {
                Email = user.Email,
                Name = user.Name
            }
        };

        var client = new PreferenceClient();
        var preference = await client.CreateAsync(request, cancellationToken: cancellationToken);
        var checkoutUrl = configuration.GetValue("MercadoPago:UseSandbox", true)
            ? preference.SandboxInitPoint
            : preference.InitPoint;

        if (string.IsNullOrWhiteSpace(preference.Id) || string.IsNullOrWhiteSpace(checkoutUrl))
        {
            throw new AppException("Falha ao gerar preferencia de pagamento.", StatusCodes.Status502BadGateway);
        }

        return new PaymentPreference(preference.Id, checkoutUrl);
    }

    private void ConfigureMercadoPago()
    {
        var accessToken = configuration["MercadoPago:AccessToken"];
        if (string.IsNullOrWhiteSpace(accessToken) || accessToken.StartsWith("CHANGE_ME", StringComparison.OrdinalIgnoreCase))
        {
            throw new AppException("Mercado Pago nao configurado.", StatusCodes.Status503ServiceUnavailable);
        }

        MercadoPagoConfig.AccessToken = accessToken;
    }
}

public interface ICheckoutService
{
    Task<CheckoutResponse> CheckoutAsync(Guid userId, CheckoutRequest request, CancellationToken cancellationToken);
}

public sealed class CheckoutService(
    IRepository<User> userRepository,
    IRepository<Plan> planRepository,
    IRepository<Subscription> subscriptionRepository,
    IDiscountService discountService,
    IPaymentGateway paymentGateway) : ICheckoutService
{
    public async Task<CheckoutResponse> CheckoutAsync(Guid userId, CheckoutRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new AppException("Usuario nao encontrado.", StatusCodes.Status404NotFound);
        var plan = await planRepository.GetByIdAsync(request.PlanId, cancellationToken)
            ?? throw new AppException("Plano nao encontrado.", StatusCodes.Status404NotFound);

        if (!plan.Active)
        {
            throw new AppException("Plano inativo.");
        }

        var discount = await discountService.CalculateAsync(plan, request.CouponCode, cancellationToken);
        var subscription = new Subscription
        {
            UserId = user.Id,
            PlanId = plan.Id,
            CouponId = discount.Coupon?.Id,
            OriginalAmount = discount.OriginalAmount,
            DiscountAmount = discount.DiscountAmount,
            FinalAmount = discount.FinalAmount,
            Status = "Pending",
            CustomerInfo = MapCustomerInfo(request.CustomerInfo),
            EndsAt = DateTimeOffset.UtcNow.AddMonths(plan.DurationMonths)
        };

        await subscriptionRepository.AddAsync(subscription, cancellationToken);
        var preference = await paymentGateway.CreatePreferenceAsync(subscription, plan, user, cancellationToken);
        subscription.PaymentPreferenceId = preference.Id;
        await subscriptionRepository.SaveChangesAsync(cancellationToken);

        return new CheckoutResponse(subscription.Id, subscription.OriginalAmount, subscription.DiscountAmount, subscription.FinalAmount, preference.Id, preference.CheckoutUrl);
    }

    private static CustomerInfo MapCustomerInfo(CustomerInfoRequest request)
    {
        return new CustomerInfo
        {
            FullName = request.FullName.Trim(),
            Cpf = OnlyDigits(request.Cpf),
            ZipCode = OnlyDigits(request.ZipCode),
            Address = request.Address.Trim()
        };
    }

    private static string OnlyDigits(string value) => new(value.Where(char.IsDigit).ToArray());
}

public sealed class PaymentStatusService(
    IConfiguration configuration,
    AppDbContext dbContext,
    ILogger<PaymentStatusService> logger) : IPaymentStatusService
{
    public async Task ProcessMercadoPagoPaymentAsync(long paymentId, CancellationToken cancellationToken)
    {
        ConfigureMercadoPago();

        var client = new PaymentClient();
        MercadoPago.Resource.Payment.Payment payment;
        try
        {
            payment = await client.GetAsync(paymentId, cancellationToken: cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Mercado Pago webhook ignorado. PaymentId: {PaymentId}", paymentId);
            return;
        }

        if (payment is null || string.IsNullOrWhiteSpace(payment.ExternalReference))
        {
            return;
        }

        if (!Guid.TryParse(payment.ExternalReference, out var orderId))
        {
            return;
        }

        var status = MapPaymentStatus(payment.Status);
        var productPurchase = await dbContext.ProductPurchases
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);

        if (productPurchase is not null)
        {
            var wasPaid = productPurchase.Status == "Paid";
            productPurchase.Status = status;

            if (status == "Paid" && !wasPaid && productPurchase.Product is not null)
            {
                productPurchase.Product.StockQuantity = Math.Max(0, productPurchase.Product.StockQuantity - productPurchase.Quantity);
                productPurchase.Product.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            return;
        }

        var subscription = await dbContext.Subscriptions.FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);
        if (subscription is not null)
        {
            subscription.Status = status;
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static string MapPaymentStatus(string? mercadoPagoStatus)
    {
        return mercadoPagoStatus?.ToLowerInvariant() switch
        {
            "approved" => "Paid",
            "authorized" or "pending" or "in_process" => "Pending",
            "rejected" => "Rejected",
            "cancelled" => "Cancelled",
            "refunded" => "Refunded",
            "charged_back" => "Chargeback",
            "in_mediation" => "InMediation",
            _ => "Pending"
        };
    }

    private void ConfigureMercadoPago()
    {
        var accessToken = configuration["MercadoPago:AccessToken"];
        if (string.IsNullOrWhiteSpace(accessToken) || accessToken.StartsWith("CHANGE_ME", StringComparison.OrdinalIgnoreCase))
        {
            throw new AppException("Mercado Pago nao configurado.", StatusCodes.Status503ServiceUnavailable);
        }

        MercadoPagoConfig.AccessToken = accessToken;
    }
}
