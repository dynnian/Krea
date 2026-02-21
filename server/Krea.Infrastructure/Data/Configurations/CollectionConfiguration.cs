using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public class CollectionConfiguration : IEntityTypeConfiguration<Collections>
{
    public void Configure(EntityTypeBuilder<Collections> builder)
    {
        builder.ToTable("collections");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .ValueGeneratedNever();

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(c => c.Description)
            .HasMaxLength(1000);

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .IsRequired();

        // Relacion Owner (User)
        builder.HasOne(c => c.Owner)
            .WithMany(u => u.Collections)
            .HasForeignKey(c => c.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Imagen opcional
        builder.HasOne(c => c.Image)
            .WithMany()
            .HasForeignKey(c => c.MediaId)
            .OnDelete(DeleteBehavior.SetNull);

        // Many-to-Many Collection ↔ Post
        builder.HasMany(c => c.Posts)
            .WithMany(p => p.Collections)
            .UsingEntity<Dictionary<string, object>>(
                "collection_post",
                j => j.HasOne<Post>()
                    .WithMany()
                    .HasForeignKey("post_id")
                    .OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Collections>()
                    .WithMany()
                    .HasForeignKey("collection_id")
                    .OnDelete(DeleteBehavior.Cascade),
                j =>
                {
                    j.HasKey("collection_id", "post_id");
                    j.ToTable("collection_post");
                });

        builder.Metadata
            .FindNavigation(nameof(Collections.Posts))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(c => c.OwnerId);
        builder.HasIndex(c => c.CreatedAt);
    }
}