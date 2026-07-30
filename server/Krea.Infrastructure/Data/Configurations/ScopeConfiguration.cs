namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public class ScopeConfiguration : IEntityTypeConfiguration<Scope> {
        public void Configure(EntityTypeBuilder<Scope> builder) {
            builder.ToTable("scopes");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Id)
                   .ValueGeneratedNever();

            builder.Property(s => s.Name)
                   .IsRequired()
                   .HasMaxLength(64);

            builder.HasIndex(s => s.Name)
                   .IsUnique();

            builder.Navigation(s => s.Permissions)
                   .UsePropertyAccessMode(PropertyAccessMode.Field);
        }
    }
}