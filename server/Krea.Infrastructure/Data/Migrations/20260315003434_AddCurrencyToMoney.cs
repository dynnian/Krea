using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krea.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrencyToMoney : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "external_ref",
                table: "payments",
                newName: "external_ref_value");

            migrationBuilder.RenameColumn(
                name: "price_amount",
                table: "membership_plans",
                newName: "amount");

            migrationBuilder.RenameColumn(
                name: "base_price",
                table: "commission_offerings",
                newName: "amount");

            migrationBuilder.AddColumn<string>(
                name: "currency",
                table: "payments",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "external_ref_provider",
                table: "payments",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "currency",
                table: "membership_plans",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "currency",
                table: "commission_offerings",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "currency",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "external_ref_provider",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "currency",
                table: "membership_plans");

            migrationBuilder.DropColumn(
                name: "currency",
                table: "commission_offerings");

            migrationBuilder.RenameColumn(
                name: "external_ref_value",
                table: "payments",
                newName: "external_ref");

            migrationBuilder.RenameColumn(
                name: "amount",
                table: "membership_plans",
                newName: "price_amount");

            migrationBuilder.RenameColumn(
                name: "amount",
                table: "commission_offerings",
                newName: "base_price");
        }
    }
}
