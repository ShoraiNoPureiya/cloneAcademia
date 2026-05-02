using ApiAcademia.Application.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Api;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var statusCode = exception switch
        {
            AppException appException => appException.StatusCode,
            ValidationException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };

        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Erro nao tratado.");
        }
        else
        {
            logger.LogWarning(exception, "Erro de aplicacao.");
        }

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = statusCode >= StatusCodes.Status500InternalServerError ? "Erro interno." : "Requisicao invalida.",
            Detail = statusCode >= StatusCodes.Status500InternalServerError
                ? "Nao foi possivel processar a requisicao."
                : exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
