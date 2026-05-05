using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerCityState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerCity",
                table: "Subscriptions",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerState",
                table: "Subscriptions",
                type: "character varying(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerCity",
                table: "ProductPurchases",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerState",
                table: "ProductPurchases",
                type: "character varying(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerCity",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "CustomerState",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "CustomerCity",
                table: "ProductPurchases");

            migrationBuilder.DropColumn(
                name: "CustomerState",
                table: "ProductPurchases");
        }
    }
}
