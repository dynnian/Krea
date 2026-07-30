namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public class GenreConfiguration : IEntityTypeConfiguration<Genre> {
        public void Configure(EntityTypeBuilder<Genre> builder) {
            builder.ToTable("genres");

            builder.HasKey(g => g.Id);

            builder.Property(g => g.Id)
                   .ValueGeneratedNever();

            builder.Property(g => g.Name)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(g => g.Type)
                   .IsRequired()
                   .HasConversion<int>();

            builder.HasIndex(g => g.Name)
                   .IsUnique();
        }
    }
}