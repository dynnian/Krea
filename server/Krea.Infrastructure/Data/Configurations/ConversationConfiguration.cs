using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public sealed class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("conversations");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(c => c.Description)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.UpdatedAt).IsRequired();
        
        builder.HasOne(c => c.Icon)
            .WithMany()
            .HasForeignKey("IconId")
            .OnDelete(DeleteBehavior.SetNull);

        // Índice por titulo
        builder.HasIndex(c => c.Title);
        
        builder.Metadata.FindNavigation(nameof(Conversation.Messages))
            ?.SetPropertyAccessMode(PropertyAccessMode.Field);
    }
}