using System.Net;
using System.Net.Mail;
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
        var host = configuration["Smtp:Host"];
        var user = configuration["Smtp:User"];
        var password = configuration["Smtp:Password"];
        var from = configuration["Smtp:From"];
        var displayName = configuration["Smtp:DisplayName"] ?? "PulseFit Academia";
        var port = configuration.GetValue("Smtp:Port", 587);
        var enableSsl = configuration.GetValue("Smtp:EnableSsl", true);

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
