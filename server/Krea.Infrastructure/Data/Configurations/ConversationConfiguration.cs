namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class ConversationConfiguration : IEntityTypeConfiguration<Conversation> {
        public void Configure(EntityTypeBuilder<Conversation> builder) {
            builder.ToTable("conversations");

            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id)
                   .ValueGeneratedNever();

            builder.Property(c => c.Type)
                   .HasConversion<string>()
                   .HasColumnName("type")
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(c => c.Title)
                   .HasColumnName("title")
                   .HasMaxLength(32)
                   .IsRequired(false);

            builder.Property(c => c.Description)
                   .HasColumnName("description")
                   .HasMaxLength(256)
                   .IsRequired(false);

            builder.Property(c => c.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired();

            builder.Property(c => c.UpdatedAt)
                   .HasColumnName("updated_at")
                   .IsRequired();

            // Icon (Media)
            builder.Property<Guid?>("IconId")
                   .HasColumnName("icon_id");

            builder.HasOne(c => c.Icon)
                   .WithMany()
                   .HasForeignKey("icon_id")
                   .OnDelete(DeleteBehavior.SetNull);

            // Participants
            builder.HasMany(c => c.Participants)
                   .WithOne(p => p.Conversation)
                   .HasForeignKey(p => p.ConversationId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Navigation(c => c.Participants)
                   .UsePropertyAccessMode(PropertyAccessMode.Field);

            // Messages
            builder.HasMany(c => c.Messages)
                   .WithOne(m => m.Conversation)
                   .HasForeignKey(m => m.ConversationId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Navigation(c => c.Messages)
                   .UsePropertyAccessMode(PropertyAccessMode.Field);

            // Índices
            builder.HasIndex(c => c.Type);
            builder.HasIndex(c => c.CreatedAt);

            builder.Metadata.FindNavigation(nameof(Conversation.Messages))
                   ?.SetPropertyAccessMode(PropertyAccessMode.Field);
        }
    }
}