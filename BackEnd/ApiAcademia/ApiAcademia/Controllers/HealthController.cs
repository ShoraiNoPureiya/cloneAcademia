using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAcademia.Infrastructure.Data;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);
        if (!canConnect)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "degraded",
                service = "ApiAcademia",
                databaseProvider = "PostgreSQL",
                database = "unavailable"
            });
        }

        return Ok(new
        {
            status = "ok",
            service = "ApiAcademia",
            databaseProvider = "PostgreSQL",
            database = "available"
        });
    }

    [HttpGet("config")]
    public IActionResult Config(IConfiguration configuration)
    {
        return Ok(new
        {
            auth = new
            {
                requireEmailConfirmation = configuration.GetValue("Auth:RequireEmailConfirmation", false),
                requireTwoFactor = configuration.GetValue("Auth:RequireTwoFactor", false)
            },
            smtp = new
            {
                hostConfigured = HasConfig(configuration, "Smtp:Host", "SmtpHost"),
                userConfigured = HasConfig(configuration, "Smtp:User", "SmtpUser"),
                passwordConfigured = HasConfig(configuration, "Smtp:Password", "SmtpPassword"),
                fromConfigured = HasConfig(configuration, "Smtp:From", "SmtpFrom"),
                port = GetIntConfig(configuration, "Smtp:Port", "SmtpPort", 587),
                enableSsl = GetBoolConfig(configuration, "Smtp:EnableSsl", "SmtpEnableSsl", true)
            },
            mercadoPago = new
            {
                accessTokenConfigured = !string.IsNullOrWhiteSpace(configuration["MercadoPago:AccessToken"]),
                notificationUrlConfigured = !string.IsNullOrWhiteSpace(configuration["MercadoPago:NotificationUrl"])
            }
        });
    }

    private static bool HasConfig(IConfiguration configuration, string sectionKey, string flatKey)
    {
        return !string.IsNullOrWhiteSpace(configuration[sectionKey] ?? configuration[flatKey]);
    }

    private static int GetIntConfig(IConfiguration configuration, string sectionKey, string flatKey, int defaultValue)
    {
        return int.TryParse(configuration[sectionKey] ?? configuration[flatKey], out var value) ? value : defaultValue;
    }

    private static bool GetBoolConfig(IConfiguration configuration, string sectionKey, string flatKey, bool defaultValue)
    {
        return bool.TryParse(configuration[sectionKey] ?? configuration[flatKey], out var value) ? value : defaultValue;
    }
}
