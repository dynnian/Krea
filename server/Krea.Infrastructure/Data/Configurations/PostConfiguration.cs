using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("post");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title)
            .HasMaxLength(64);

        builder.HasOne(p => p.RepliedTo)
            .WithMany()
            .HasForeignKey(p => p.RepliedToId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.RepostOf)
            .WithMany()
            .HasForeignKey(p => p.RepostOfId)
            .OnDelete(DeleteBehavior.Restrict);

        // Post <-> Hashtag (N:N)
        builder.HasMany(p => p.Hashtags)
            .WithMany(h => h.Posts)
            .UsingEntity<Dictionary<string, object>>(
                "post_hashtag",
                j => j.HasOne<Hashtag>()
                    .WithMany()
                    .HasForeignKey("tag_id"),
                j => j.HasOne<Post>()
                    .WithMany()
                    .HasForeignKey("post_id"),
                j =>
                {
                    j.HasKey("post_id", "tag_id");
                    j.ToTable("post_hashtag");
                });
    }
}
