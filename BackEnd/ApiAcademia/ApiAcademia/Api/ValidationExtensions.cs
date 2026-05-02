using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Api;

public static class ValidationExtensions
{
    public static async Task<ActionResult?> ToBadRequestIfInvalidAsync<T>(
        this IValidator<T> validator,
        T instance,
        CancellationToken cancellationToken)
    {
        var result = await validator.ValidateAsync(instance, cancellationToken);
        if (result.IsValid)
        {
            return null;
        }

        var errors = result.Errors
            .GroupBy(x => x.PropertyName)
            .ToDictionary(x => x.Key, x => x.Select(e => e.ErrorMessage).ToArray());

        return new BadRequestObjectResult(new ValidationProblemDetails(errors)
        {
            Title = "Dados invalidos.",
            Status = StatusCodes.Status400BadRequest
        });
    }
}
