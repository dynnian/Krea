using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krea.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class PendingModelSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE metadata
                ALTER COLUMN "Width" TYPE integer
                USING NULLIF(regexp_replace("Width", '[^0-9-]', '', 'g'), '')::integer;
                """);

            migrationBuilder.Sql(
                """
                ALTER TABLE metadata
                ALTER COLUMN "Height" TYPE integer
                USING NULLIF(regexp_replace("Height", '[^0-9-]', '', 'g'), '')::integer;
                """);

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
            migrationBuilder.Sql(
                """
                ALTER TABLE metadata
                ALTER COLUMN "Width" TYPE text
                USING "Width"::text;
                """);

            migrationBuilder.Sql(
                """
                ALTER TABLE metadata
                ALTER COLUMN "Height" TYPE text
                USING "Height"::text;
                """);

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
