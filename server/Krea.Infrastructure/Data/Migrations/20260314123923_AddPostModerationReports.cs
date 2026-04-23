using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krea.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPostModerationReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "post_moderation_reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PostId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReporterUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Reason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Details = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ResolvedAction = table.Column<int>(type: "integer", nullable: true),
                    ResolvedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModeratorNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_moderation_reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_post_moderation_reports_posts_PostId",
                        column: x => x.PostId,
                        principalTable: "posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_post_moderation_reports_users_ReporterUserId",
                        column: x => x.ReporterUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_post_moderation_reports_CreatedAt",
                table: "post_moderation_reports",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_post_moderation_reports_PostId",
                table: "post_moderation_reports",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_post_moderation_reports_ReporterUserId",
                table: "post_moderation_reports",
                column: "ReporterUserId");

            migrationBuilder.CreateIndex(
                name: "IX_post_moderation_reports_Status",
                table: "post_moderation_reports",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "post_moderation_reports");
        }
    }
}
