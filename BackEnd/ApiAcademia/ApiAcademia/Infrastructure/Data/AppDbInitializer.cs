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

        await dbContext.Database.EnsureCreatedAsync();

        var adminEmail = configuration["SeedAdmin:Email"] ?? "admin@pulsefit.com";
        var adminPassword = configuration["SeedAdmin:Password"] ?? "Admin@123456789";

        if (await dbContext.Users.AnyAsync(x => x.Email == adminEmail))
        {
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
    }
}
