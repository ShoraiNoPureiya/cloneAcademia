using System.Net;
using System.Net.Mail;
using System.Security.Authentication;
using ApiAcademia.Application.Exceptions;

namespace ApiAcademia.Application.Services;

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken);
}

public sealed class SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken)
    {
        var host = GetConfig("Smtp:Host", "SmtpHost");
        var user = GetConfig("Smtp:User", "SmtpUser");
        var password = GetConfig("Smtp:Password", "SmtpPassword");
        var from = GetConfig("Smtp:From", "SmtpFrom");
        var displayName = GetConfig("Smtp:DisplayName", "SmtpDisplayName") ?? "PulseFit Academia";
        var port = GetIntConfig("Smtp:Port", "SmtpPort", 587);
        var enableSsl = GetBoolConfig("Smtp:EnableSsl", "SmtpEnableSsl", true);

        if (string.IsNullOrWhiteSpace(host) ||
            string.IsNullOrWhiteSpace(user) ||
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(from))
        {
            logger.LogError("SMTP nao configurado. Configure Smtp:Host, Smtp:Port, Smtp:User, Smtp:Password e Smtp:From.");
            throw new AppException("Servico de email nao configurado.", StatusCodes.Status503ServiceUnavailable);
        }

        using var message = new MailMessage
        {
            From = new MailAddress(from, displayName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(to));

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            Credentials = new NetworkCredential(user, password),
            DeliveryMethod = SmtpDeliveryMethod.Network
        };

        try
        {
            await client.SendMailAsync(message, cancellationToken);
        }
        catch (SmtpException exception)
        {
            logger.LogError(exception, "Falha ao enviar email SMTP para {Email}.", to);
            throw new AppException("Nao foi possivel enviar o email de verificacao.", StatusCodes.Status502BadGateway);
        }
        catch (AuthenticationException exception)
        {
            logger.LogError(exception, "Falha de autenticacao SMTP para {Email}.", to);
            throw new AppException("Falha de autenticacao SMTP. Verifique usuario, senha de app e SSL.", StatusCodes.Status502BadGateway);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Falha inesperada ao enviar email SMTP para {Email}.", to);
            throw new AppException("Nao foi possivel enviar email via SMTP. Verifique as variaveis Smtp__Host, Smtp__Port, Smtp__User, Smtp__Password e Smtp__From.", StatusCodes.Status502BadGateway);
        }
    }

    private string? GetConfig(string sectionKey, string flatKey)
    {
        return configuration[sectionKey] ?? configuration[flatKey];
    }

    private int GetIntConfig(string sectionKey, string flatKey, int defaultValue)
    {
        return int.TryParse(GetConfig(sectionKey, flatKey), out var value) ? value : defaultValue;
    }

    private bool GetBoolConfig(string sectionKey, string flatKey, bool defaultValue)
    {
        return bool.TryParse(GetConfig(sectionKey, flatKey), out var value) ? value : defaultValue;
    }
}

public sealed class LoggingEmailSender(ILogger<LoggingEmailSender> logger) : IEmailSender
{
    public Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken)
    {
        logger.LogInformation("Email de desenvolvimento para {Email}. Assunto: {Subject}. Corpo: {Body}", to, subject, body);
        return Task.CompletedTask;
    }
}
