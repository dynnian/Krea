using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations {
    using Microsoft.EntityFrameworkCore.Metadata;

    public class PostConfiguration : IEntityTypeConfiguration<Post> {
        public void Configure(EntityTypeBuilder<Post> builder) {
            builder.ToTable("posts");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Id)
                   .ValueGeneratedNever();

            builder.Property(p => p.Title)
                   .IsRequired()
                   .HasMaxLength(64);

            builder.Property(p => p.Content)
                   .HasMaxLength(2000);

            builder.Property(p => p.Type)
                   .HasConversion<int>()
                   .IsRequired();

            builder.Property(p => p.IsWork)
                   .IsRequired();

            builder.Property(p => p.IsDeleted)
                   .IsRequired();

            builder.Property(p => p.IsLocal)
                   .IsRequired();

            builder.Property(p => p.UploadedAt)
                   .IsRequired();

            builder.Property(p => p.UpdatedAt)
                   .IsRequired();

            builder.Property(p => p.DeletedAt);

            // Relación Author (User → Posts)
            builder.HasOne(p => p.AuthorPost)
                   .WithMany(u => u.Posts)
                   .HasForeignKey(p => p.AuthorPostId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Self-reference Reply
            builder.HasOne(p => p.RepliedTo)
                   .WithMany()
                   .HasForeignKey(p => p.RepliedToId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Self-reference Repost
            builder.HasOne(p => p.RepostOf)
                   .WithMany()
                   .HasForeignKey(p => p.RepostOfId)
                   .OnDelete(DeleteBehavior.Restrict);

            // One-to-Many Post → Uploads
            builder.HasMany(p => p.Uploads)
                   .WithOne(u => u.Post)
                   .HasForeignKey(u => u.PostId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Navigation(p => p.Uploads)
                   .UsePropertyAccessMode(PropertyAccessMode.Field);

            // Many-to-Many Post ↔ Hashtag
            builder.HasMany(p => p.Hashtags)
                   .WithMany()
                   .UsingEntity<Dictionary<string, object>>(
                       "post_hashtag",
                       j => j.HasOne<Hashtag>()
                             .WithMany()
                             .HasForeignKey("hashtag_id")
                             .OnDelete(DeleteBehavior.Cascade),
                       j => j.HasOne<Post>()
                             .WithMany()
                             .HasForeignKey("post_id")
                             .OnDelete(DeleteBehavior.Cascade),
                       j => {
                           j.HasKey("post_id", "hashtag_id");
                           j.ToTable("post_hashtag");
                       });

            IMutableNavigation? navigation = builder.Metadata.FindNavigation(nameof(Post.Hashtags));
            navigation?.SetPropertyAccessMode(PropertyAccessMode.Field);

            // One-to-Many Post → Likes
            builder.HasMany(p => p.Likes)
                   .WithOne(l => l.Post)
                   .HasForeignKey(l => l.PostId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Navigation(p => p.Likes)
                   .UsePropertyAccessMode(PropertyAccessMode.Field);

            // Many-to-Many Post ↔ Collection
            builder.HasMany(p => p.Collections)
                   .WithMany(c => c.Posts);

            builder.Navigation(p => p.Collections)
                   .UsePropertyAccessMode(PropertyAccessMode.Field);

            // Indices
            builder.HasIndex(p => p.AuthorPostId);
            builder.HasIndex(p => p.UploadedAt);
            builder.HasIndex(p => p.IsDeleted);
        }
    }
}