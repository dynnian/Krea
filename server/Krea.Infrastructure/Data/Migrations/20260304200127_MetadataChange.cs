using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krea.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class MetadataChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE metadata 
                ALTER COLUMN ""Width"" 
                TYPE integer 
                USING ""Width""::integer;");

            migrationBuilder.Sql(
                @"ALTER TABLE metadata 
                ALTER COLUMN ""Height"" 
                TYPE integer 
                USING ""Height""::integer;");

            migrationBuilder.AlterColumn<long>(
                name: "FileSize",
                table: "metadata",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Width",
                table: "metadata",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Height",
                table: "metadata",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "FileSize",
                table: "metadata",
                type: "integer",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);
        }
    }
}
