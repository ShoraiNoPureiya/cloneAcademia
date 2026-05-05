using ApiAcademia.Application.Exceptions;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

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
        var timeoutSeconds = GetIntConfig("Smtp:TimeoutSeconds", "SmtpTimeoutSeconds", 20);

        if (string.IsNullOrWhiteSpace(host) ||
            string.IsNullOrWhiteSpace(user) ||
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(from))
        {
            logger.LogError("SMTP nao configurado. Configure Smtp:Host, Smtp:Port, Smtp:User, Smtp:Password e Smtp:From.");
            throw new AppException("Servico de email nao configurado.", StatusCodes.Status503ServiceUnavailable);
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(displayName, from));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new BodyBuilder
        {
            HtmlBody = body
        }.ToMessageBody();

        var socketOptions = GetSecureSocketOptions(port, enableSsl);

        try
        {
            using var client = new SmtpClient();
            client.Timeout = Math.Clamp(timeoutSeconds, 5, 120) * 1000;
            await client.ConnectAsync(host, port, socketOptions, cancellationToken);
            await client.AuthenticateAsync(user, password, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Falha inesperada ao enviar email SMTP para {Email}.", to);
            throw new AppException("Nao foi possivel enviar email via SMTP. Verifique host, porta, usuario, senha, remetente e SSL.", StatusCodes.Status502BadGateway);
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

    private static SecureSocketOptions GetSecureSocketOptions(int port, bool enableSsl)
    {
        if (!enableSsl)
        {
            return SecureSocketOptions.None;
        }

        return port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
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
