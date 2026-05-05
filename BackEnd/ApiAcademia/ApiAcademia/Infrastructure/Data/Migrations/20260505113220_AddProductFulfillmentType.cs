using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProductFulfillmentType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FulfillmentType",
                table: "ProductPurchases",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Delivery");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FulfillmentType",
                table: "ProductPurchases");
        }
    }
}
