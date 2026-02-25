using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations {
    public class PostUploadConfiguration : IEntityTypeConfiguration<PostUpload> {
        public void Configure(EntityTypeBuilder<PostUpload> builder) {
            builder.ToTable("post_uploads");

            builder.HasKey(pu => pu.Id);

            builder.Property(pu => pu.Id)
                   .ValueGeneratedNever();

            builder.Property(pu => pu.IsWorkMedia)
                   .IsRequired();

            // Relacion Post (Many-to-One)
            builder.HasOne(pu => pu.Post)
                   .WithMany(p => p.Uploads)
                   .HasForeignKey(pu => pu.PostId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Relacion Media (Many-to-One)
            builder.HasOne(pu => pu.Media)
                   .WithMany()
                   .HasForeignKey(pu => pu.MediaId)
                   .OnDelete(DeleteBehavior.Restrict);

            // One-to-One con Metadata
            builder.HasOne(pu => pu.Metadata)
                   .WithOne(m => m.Upload)
                   .HasForeignKey<Metadata>(m => m.UploadId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(pu => new { pu.PostId, pu.MediaId })
                   .IsUnique();
        }
    }
}