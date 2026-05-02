using System.Security.Claims;
using ApiAcademia.Api;
using ApiAcademia.Application.Dtos;
using ApiAcademia.Application.Exceptions;
using ApiAcademia.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
[EnableRateLimiting("payments")]
public sealed class PaymentController(
    ICheckoutService checkoutService,
    IPaymentStatusService paymentStatusService) : ControllerBase
{
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(
        CheckoutRequest request,
        IValidator<CheckoutRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(id, out var userId))
        {
            throw new AppException("Token invalido.", StatusCodes.Status401Unauthorized);
        }

        return Ok(await checkoutService.CheckoutAsync(userId, request, cancellationToken));
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> MercadoPagoWebhook(
        [FromQuery(Name = "data.id")] string? queryDataId,
        [FromQuery(Name = "id")] string? queryId,
        [FromQuery(Name = "type")] string? queryType,
        [FromQuery(Name = "topic")] string? queryTopic,
        [FromBody] MercadoPagoWebhookRequest? request,
        CancellationToken cancellationToken)
    {
        var eventType = request?.Type ?? queryType ?? queryTopic;
        var paymentIdValue = request?.Data?.Id ?? queryDataId ?? queryId;

        if (!string.Equals(eventType, "payment", StringComparison.OrdinalIgnoreCase) ||
            !long.TryParse(paymentIdValue, out var paymentId))
        {
            return Ok();
        }

        await paymentStatusService.ProcessMercadoPagoPaymentAsync(paymentId, cancellationToken);
        return Ok();
    }
}
