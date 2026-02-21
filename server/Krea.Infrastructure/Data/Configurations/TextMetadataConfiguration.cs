using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.DependencyInjection;

namespace Krea.Infrastructure.Data.Configurations;

public class TextMetadataConfiguration : IEntityTypeConfiguration<TextMetadata>
{
    public void Configure(EntityTypeBuilder<TextMetadata> builder)
    {
        builder.Property(t => t.SortTitle);
        
        builder.Property(t => t.Subtitle);
        
        builder.Property(t => t.WordCount)
            .IsRequired();

        builder.Property(t => t.LanguageCode)
            .HasMaxLength(50);
    }
}