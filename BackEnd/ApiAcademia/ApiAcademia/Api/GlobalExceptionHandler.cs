using ApiAcademia.Application.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Net.Mail;
using System.Security.Authentication;

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
            NpgsqlException => StatusCodes.Status503ServiceUnavailable,
            InvalidOperationException invalidOperationException when invalidOperationException.InnerException is NpgsqlException => StatusCodes.Status503ServiceUnavailable,
            SmtpException => StatusCodes.Status502BadGateway,
            AuthenticationException => StatusCodes.Status502BadGateway,
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
            Title = statusCode == StatusCodes.Status503ServiceUnavailable ? "Servico indisponivel." :
                statusCode == StatusCodes.Status502BadGateway ? "Falha em servico externo." :
                statusCode >= StatusCodes.Status500InternalServerError ? "Erro interno." : "Requisicao invalida.",
            Detail = exception is NpgsqlException || exception is InvalidOperationException { InnerException: NpgsqlException }
                ? "Banco de dados indisponivel. Verifique a DATABASE_URL do backend no Render."
                : exception is SmtpException or AuthenticationException
                ? "Nao foi possivel enviar email via SMTP. Verifique host, porta, usuario, senha e SSL."
                : statusCode >= StatusCodes.Status500InternalServerError
                ? "Nao foi possivel processar a requisicao."
                : exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
