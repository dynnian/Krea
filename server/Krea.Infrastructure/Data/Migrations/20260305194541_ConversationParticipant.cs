using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krea.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ConversationParticipant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_conversations_media_IconId",
                table: "conversations");

            migrationBuilder.DropIndex(
                name: "IX_conversations_IconId",
                table: "conversations");

            migrationBuilder.DropIndex(
                name: "IX_conversations_Title",
                table: "conversations");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "conversations",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "conversations",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "conversations",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "IconId",
                table: "conversations",
                newName: "icon_id");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "conversations",
                newName: "created_at");

            migrationBuilder.AlterColumn<string>(
                name: "title",
                table: "conversations",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32);

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "conversations",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AddColumn<Guid>(
                name: "icon_id1",
                table: "conversations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "type",
                table: "conversations",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "conversation_participants",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    left_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_muted = table.Column<bool>(type: "boolean", nullable: false),
                    last_read_message_id = table.Column<Guid>(type: "uuid", nullable: true),
                    unread_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_conversation_participants", x => new { x.user_id, x.conversation_id });
                    table.ForeignKey(
                        name: "FK_conversation_participants_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_conversation_participants_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_messages_ConversationId_sent_at",
                table: "messages",
                columns: new[] { "ConversationId", "sent_at" });

            migrationBuilder.CreateIndex(
                name: "IX_conversations_created_at",
                table: "conversations",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_conversations_icon_id1",
                table: "conversations",
                column: "icon_id1");

            migrationBuilder.CreateIndex(
                name: "IX_conversations_type",
                table: "conversations",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "IX_conversation_participants_conversation_id",
                table: "conversation_participants",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "IX_conversation_participants_user_id",
                table: "conversation_participants",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_conversation_participants_user_id_left_at",
                table: "conversation_participants",
                columns: new[] { "user_id", "left_at" });

            migrationBuilder.AddForeignKey(
                name: "FK_conversations_media_icon_id1",
                table: "conversations",
                column: "icon_id1",
                principalTable: "media",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_conversations_media_icon_id1",
                table: "conversations");

            migrationBuilder.DropTable(
                name: "conversation_participants");

            migrationBuilder.DropIndex(
                name: "IX_messages_ConversationId_sent_at",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "IX_conversations_created_at",
                table: "conversations");

            migrationBuilder.DropIndex(
                name: "IX_conversations_icon_id1",
                table: "conversations");

            migrationBuilder.DropIndex(
                name: "IX_conversations_type",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "icon_id1",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "type",
                table: "conversations");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "conversations",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "conversations",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "conversations",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "icon_id",
                table: "conversations",
                newName: "IconId");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "conversations",
                newName: "CreatedAt");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "conversations",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "conversations",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_conversations_IconId",
                table: "conversations",
                column: "IconId");

            migrationBuilder.CreateIndex(
                name: "IX_conversations_Title",
                table: "conversations",
                column: "Title");

            migrationBuilder.AddForeignKey(
                name: "FK_conversations_media_IconId",
                table: "conversations",
                column: "IconId",
                principalTable: "media",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
