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
}
