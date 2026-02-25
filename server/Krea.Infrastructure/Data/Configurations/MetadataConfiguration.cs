using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations {
    public class MetadataConfiguration : IEntityTypeConfiguration<Metadata> {
        public void Configure(EntityTypeBuilder<Metadata> builder) {
            builder.ToTable("metadata");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Id)
                   .ValueGeneratedNever();

            builder.Property(m => m.Title)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(m => m.Description)
                   .HasMaxLength(1000);

            // Discriminador para TPH
            builder
                .HasDiscriminator<string>("metadata_type")
                .HasValue<MusicMetadata>("music")
                .HasValue<ImageMetadata>("image")
                .HasValue<TextMetadata>("text");

            // One-to-One con PostUpload
            builder.HasOne(m => m.Upload)
                   .WithOne(pu => pu.Metadata)
                   .HasForeignKey<Metadata>(m => m.UploadId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(m => m.UploadId)
                   .IsUnique();

            // Many-to-Many con Genre
            builder.HasMany(m => m.Genres)
                   .WithMany()
                   .UsingEntity<Dictionary<string, object>>(
                       "metadata_genre",
                       j => j.HasOne<Genre>().WithMany().HasForeignKey("GenreId"),
                       j => j.HasOne<Metadata>().WithMany().HasForeignKey("MetadataId"),
                       j => {
                           j.HasKey("MetadataId", "GenreId");
                           j.ToTable("metadata_genre");
                       });

            builder.Metadata
                   .FindNavigation(nameof(Metadata.Genres))!
                   .SetPropertyAccessMode(PropertyAccessMode.Field);
        }
    }
}