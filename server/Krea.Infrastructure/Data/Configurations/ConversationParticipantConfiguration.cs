namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class ConversationParticipantConfiguration
        : IEntityTypeConfiguration<ConversationParticipant> {
        public void Configure(EntityTypeBuilder<ConversationParticipant> builder) {
            builder.ToTable("conversation_participants");

            // Composite PK
            builder.HasKey(p => new { p.UserId, p.ConversationId });

            builder.Property(p => p.UserId)
                   .HasColumnName("user_id")
                   .IsRequired();

            builder.Property(p => p.ConversationId)
                   .HasColumnName("conversation_id")
                   .IsRequired();

            builder.Property(p => p.Role)
                   .HasConversion<string>()
                   .HasColumnName("role")
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(p => p.JoinedAt)
                   .HasColumnName("joined_at")
                   .IsRequired();

            builder.Property(p => p.LeftAt)
                   .HasColumnName("left_at");

            builder.Property(p => p.IsMuted)
                   .HasColumnName("is_muted")
                   .IsRequired();

            builder.Property(p => p.LastReadMessageId)
                   .HasColumnName("last_read_message_id");

            builder.Property(p => p.UnreadCount)
                   .HasColumnName("unread_count")
                   .IsRequired();

            // Indexes

            builder.HasIndex(p => p.UserId);
            builder.HasIndex(p => p.ConversationId);
            builder.HasIndex(p => new { p.UserId, p.LeftAt });
        }
    }
}