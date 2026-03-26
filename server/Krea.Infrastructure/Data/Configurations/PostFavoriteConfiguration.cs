namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class PostFavoriteConfiguration 
        : IEntityTypeConfiguration<PostFavorite>
    {
        public void Configure(EntityTypeBuilder<PostFavorite> builder)
        {
            builder.ToTable("post_favorites");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.Property(x => x.PostId)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.HasIndex(x => new { x.UserId, x.PostId })
                .IsUnique();

            builder.HasOne(x => x.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Post)
                .WithMany(p => p.Favorites)
                .HasForeignKey(x => x.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}