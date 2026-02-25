using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public class HashtagConfiguration : IEntityTypeConfiguration<Hashtag>
{
    public void Configure(EntityTypeBuilder<Hashtag> builder)
    {
        builder.ToTable("hashtags");

        builder.HasKey(h => h.Id);

        builder.Property(h => h.Id)
            .ValueGeneratedNever();

        builder.Property(h => h.Name)
            .IsRequired()
            .HasMaxLength(64);

        // Evita duplicados (#music, #Music)
        builder.HasIndex(h => h.Name)
            .IsUnique();

        // Backing field
        builder.Navigation(h => h.Posts)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}