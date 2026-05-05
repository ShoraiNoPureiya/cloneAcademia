using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProductPurchaseCoupons : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CouponId",
                table: "ProductPurchases",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "ProductPurchases",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OriginalAmount",
                table: "ProductPurchases",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql("""
                UPDATE "ProductPurchases"
                SET "OriginalAmount" = "TotalAmount"
                WHERE "OriginalAmount" = 0
                """);

            migrationBuilder.CreateIndex(
                name: "IX_ProductPurchases_CouponId",
                table: "ProductPurchases",
                column: "CouponId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductPurchases_Coupons_CouponId",
                table: "ProductPurchases",
                column: "CouponId",
                principalTable: "Coupons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductPurchases_Coupons_CouponId",
                table: "ProductPurchases");

            migrationBuilder.DropIndex(
                name: "IX_ProductPurchases_CouponId",
                table: "ProductPurchases");

            migrationBuilder.DropColumn(
                name: "CouponId",
                table: "ProductPurchases");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "ProductPurchases");

            migrationBuilder.DropColumn(
                name: "OriginalAmount",
                table: "ProductPurchases");
        }
    }
}
