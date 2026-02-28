namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    
    public class MusicMetadataConfiguration : IEntityTypeConfiguration<MusicMetadata> {
        public void Configure(EntityTypeBuilder<MusicMetadata> builder) {
            builder.Property(m => m.DurationSec)
                   .IsRequired();

            builder.Property(m => m.BitrateKbps)
                   .IsRequired();
        }
    }
}