namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public class PostUploadConfiguration : IEntityTypeConfiguration<PostUpload> {
        public void Configure(EntityTypeBuilder<PostUpload> builder) {
            builder.ToTable("post_uploads");

            builder.HasKey(pu => pu.Id);

            builder.Property(pu => pu.Id)
                   .ValueGeneratedNever();

            builder.Property(pu => pu.IsWorkMedia)
                   .IsRequired();

            builder.Property(pu => pu.CoverMediaId)
                   .IsRequired(false);

            // Relacion Post (Many-to-One)
            builder.HasOne(pu => pu.Post)
                   .WithMany(p => p.Uploads)
                   .HasForeignKey(pu => pu.PostId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Relacion Media principal (Many-to-One)
            builder.HasOne(pu => pu.Media)
                   .WithMany()
                   .HasForeignKey(pu => pu.MediaId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Relacion CoverMedia (Many-to-One opcional)
            builder.HasOne(pu => pu.CoverMedia)
                   .WithMany()
                   .HasForeignKey(pu => pu.CoverMediaId)
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