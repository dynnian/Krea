namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    
    public class ImageMetadataConfiguration : IEntityTypeConfiguration<ImageMetadata> {
        public void Configure(EntityTypeBuilder<ImageMetadata> builder) {
            builder.Property(i => i.Width)
                   .IsRequired();

            builder.Property(i => i.Height)
                   .IsRequired();

            builder.Property(i => i.FileSize)
                   .IsRequired();

            builder.Property(i => i.Format)
                   .HasMaxLength(20);
        }
    }
}