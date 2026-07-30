namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public class LikeConfiguration : IEntityTypeConfiguration<Like> {
        public void Configure(EntityTypeBuilder<Like> builder) {
            builder.ToTable("likes");

            builder.HasKey(l => l.Id);

            builder.Property(l => l.Id)
                   .ValueGeneratedNever();

            builder.Property(l => l.CreatedAt)
                   .IsRequired();

            // Relacion User → Likes
            builder.HasOne(l => l.User)
                   .WithMany(u => u.Likes)
                   .HasForeignKey(l => l.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Relacion Post → Likes
            builder.HasOne(l => l.Post)
                   .WithMany(p => p.Likes)
                   .HasForeignKey(l => l.PostId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Un usuario no puede dar like dos veces al mismo post
            builder.HasIndex(l => new { l.UserId, l.PostId })
                   .IsUnique();
        }
    }
}