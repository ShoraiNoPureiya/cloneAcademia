using ApiAcademia.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ApiAcademia.Infrastructure.Data;

public static class AppDbInitializer
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseStartup");
        var environment = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();

        try
        {
            await MigrateWithRetryAsync(dbContext, logger);
        }
        catch (Exception exception) when (environment.IsProduction())
        {
            logger.LogError(exception, "Nao foi possivel conectar/migrar o PostgreSQL no startup. A API continuara online para o Render, mas endpoints com banco falharao ate a DATABASE_URL estar correta.");
            return;
        }

        var adminEmail = configuration["SeedAdmin:Email"] ?? "admin@pulsefit.com";
        var adminPassword = configuration["SeedAdmin:Password"] ?? "Admin@123456789";

        var existingAdmin = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == adminEmail);
        if (existingAdmin is not null)
        {
            existingAdmin.Name = string.IsNullOrWhiteSpace(existingAdmin.Name) ? "Administrador PulseFit" : existingAdmin.Name;
            existingAdmin.Role = "Admin";
            existingAdmin.EmailConfirmed = true;
            existingAdmin.TwoFactorEnabled = false;
            existingAdmin.PasswordHash = passwordHasher.HashPassword(existingAdmin, adminPassword);
            await dbContext.SaveChangesAsync();
            logger.LogInformation("Admin seed sincronizado para {Email}.", adminEmail);
            return;
        }

        var admin = new User
        {
            Name = "Administrador PulseFit",
            Email = adminEmail,
            Role = "Admin",
            EmailConfirmed = true,
            TwoFactorEnabled = false
        };
        admin.PasswordHash = passwordHasher.HashPassword(admin, adminPassword);

        await dbContext.Users.AddAsync(admin);
        await dbContext.SaveChangesAsync();
        logger.LogInformation("Admin seed criado para {Email}.", adminEmail);
    }

    private static async Task MigrateWithRetryAsync(AppDbContext dbContext, ILogger logger)
    {
        const int attempts = 6;

        for (var attempt = 1; attempt <= attempts; attempt++)
        {
            try
            {
                await dbContext.Database.MigrateAsync();
                return;
            }
            catch (Exception exception) when (attempt < attempts)
            {
                logger.LogWarning(exception, "Falha ao conectar/migrar PostgreSQL. Tentativa {Attempt}/{Attempts}.", attempt, attempts);
                await Task.Delay(TimeSpan.FromSeconds(10));
            }
        }

        await dbContext.Database.MigrateAsync();
    }
}
