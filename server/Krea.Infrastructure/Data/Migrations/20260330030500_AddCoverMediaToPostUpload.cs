using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krea.Infrastructure.Data.Migrations {
    /// <inheritdoc />
    public partial class AddCoverMediaToPostUpload : Migration {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder) {
            migrationBuilder.AddColumn<Guid>(
                name: "CoverMediaId",
                table: "post_uploads",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_post_uploads_CoverMediaId",
                table: "post_uploads",
                column: "CoverMediaId");

            migrationBuilder.AddForeignKey(
                name: "FK_post_uploads_media_CoverMediaId",
                table: "post_uploads",
                column: "CoverMediaId",
                principalTable: "media",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder) {
            migrationBuilder.DropForeignKey(
                name: "FK_post_uploads_media_CoverMediaId",
                table: "post_uploads");

            migrationBuilder.DropIndex(
                name: "IX_post_uploads_CoverMediaId",
                table: "post_uploads");

            migrationBuilder.DropColumn(
                name: "CoverMediaId",
                table: "post_uploads");
        }
    }
}