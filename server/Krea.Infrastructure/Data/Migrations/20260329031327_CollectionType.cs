using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krea.Infrastructure.Data.Migrations {
    /// <inheritdoc />
    public partial class CollectionType : Migration {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder) {
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "collections",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder) {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "collections");
        }
    }
}