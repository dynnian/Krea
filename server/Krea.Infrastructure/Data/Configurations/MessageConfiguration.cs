namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class MessageConfiguration : IEntityTypeConfiguration<Message> {
        public void Configure(EntityTypeBuilder<Message> builder) {
            builder.ToTable("messages");

            builder.HasKey(m => m.Id);
            builder.Property(m => m.Id).ValueGeneratedNever();

            builder.Property<Guid>("UserId");
            builder.HasOne(m => m.User)
                   .WithMany()
                   .HasForeignKey("UserId")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(m => m.ContentType)
                   .HasConversion<string>()
                   .HasColumnName("content_type")
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(m => m.TextContent)
                   .HasColumnName("text_content")
                   .HasColumnType("text")
                   .IsRequired(false);

            builder.Property(m => m.SentAt)
                   .HasColumnName("sent_at")
                   .IsRequired();

            builder.Property(m => m.UpdatedAt)
                   .HasColumnName("updated_at")
                   .IsRequired();

            builder.HasMany(m => m.MediaAttachments)
                   .WithMany()
                   .UsingEntity<Dictionary<string, object>>(
                       "message_media",
                       j => j.HasOne<Media>().WithMany().HasForeignKey("media_id"),
                       j => j.HasOne<Message>().WithMany().HasForeignKey("message_id"),
                       j => {
                           j.HasKey("message_id", "media_id");
                           j.ToTable("message_media");
                       });

            // Índices
            builder.HasIndex(m => m.ConversationId);
            builder.HasIndex(m => m.UserId);
            builder.HasIndex(m => m.SentAt);
            builder.HasIndex(m => new { m.ConversationId, m.SentAt });
        }
    }
}