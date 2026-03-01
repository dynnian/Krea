namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public class MediaConfiguration : IEntityTypeConfiguration<Media> {
        public void Configure(EntityTypeBuilder<Media> builder) {
            builder.ToTable("media");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Id)
                   .ValueGeneratedNever();

            builder.Property(m => m.OriginalFileName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(m => m.FileName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(m => m.MimeType)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(m => m.Path)
                   .IsRequired()
                   .HasMaxLength(254);

            builder.Property(m => m.UploadedAt)
                   .IsRequired();

            builder.HasIndex(m => m.FileName)
                   .IsUnique();
        }
    }
}