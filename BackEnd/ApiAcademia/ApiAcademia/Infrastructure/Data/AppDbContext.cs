using ApiAcademia.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApiAcademia.Infrastructure.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductPurchase> ProductPurchases => Set<ProductPurchase>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Email).HasMaxLength(180);
            entity.Property(x => x.Role).HasMaxLength(40);
        });

        modelBuilder.Entity<Plan>(entity =>
        {
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.HasIndex(x => x.Code).IsUnique();
            entity.Property(x => x.Code).HasMaxLength(40);
            entity.Property(x => x.DiscountAmount).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(x => x.Sku).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(120);
            entity.Property(x => x.Description).HasMaxLength(500);
            entity.Property(x => x.Sku).HasMaxLength(60);
            entity.Property(x => x.ImageContentType).HasMaxLength(100);
            entity.Property(x => x.ImageFileName).HasMaxLength(255);
            entity.Property(x => x.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<ProductPurchase>(entity =>
        {
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);
            entity.Property(x => x.TotalAmount).HasPrecision(18, 2);
            entity.Property(x => x.Status).HasMaxLength(40);
            entity.Property(x => x.PaymentPreferenceId).HasMaxLength(120);
            entity.OwnsOne(x => x.CustomerInfo, customer =>
            {
                customer.Property(x => x.FullName).HasColumnName("CustomerFullName").HasMaxLength(160);
                customer.Property(x => x.Cpf).HasColumnName("CustomerCpf").HasMaxLength(14);
                customer.Property(x => x.ZipCode).HasColumnName("CustomerZipCode").HasMaxLength(8);
                customer.Property(x => x.Address).HasColumnName("CustomerAddress").HasMaxLength(240);
            });
            entity.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
            entity.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.Property(x => x.OriginalAmount).HasPrecision(18, 2);
            entity.Property(x => x.DiscountAmount).HasPrecision(18, 2);
            entity.Property(x => x.FinalAmount).HasPrecision(18, 2);
            entity.OwnsOne(x => x.CustomerInfo, customer =>
            {
                customer.Property(x => x.FullName).HasColumnName("CustomerFullName").HasMaxLength(160);
                customer.Property(x => x.Cpf).HasColumnName("CustomerCpf").HasMaxLength(14);
                customer.Property(x => x.ZipCode).HasColumnName("CustomerZipCode").HasMaxLength(8);
                customer.Property(x => x.Address).HasColumnName("CustomerAddress").HasMaxLength(240);
            });
            entity.HasOne(x => x.User).WithMany(x => x.Subscriptions).HasForeignKey(x => x.UserId);
            entity.HasOne(x => x.Plan).WithMany(x => x.Subscriptions).HasForeignKey(x => x.PlanId);
            entity.HasOne(x => x.Coupon).WithMany(x => x.Subscriptions).HasForeignKey(x => x.CouponId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
