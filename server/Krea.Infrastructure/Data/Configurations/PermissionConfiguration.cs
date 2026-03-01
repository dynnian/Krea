namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public class PermissionConfiguration : IEntityTypeConfiguration<Permission> {
        public void Configure(EntityTypeBuilder<Permission> builder) {
            builder.ToTable("permissions");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Id)
                   .ValueGeneratedNever();

            builder.Property(p => p.Name)
                   .IsRequired()
                   .HasMaxLength(64);

            builder.Property(p => p.Description)
                   .HasMaxLength(256);

            builder.Property(p => p.CreatedAt)
                   .IsRequired();

            // Relacion con Scope
            builder.HasOne(p => p.Scope)
                   .WithMany(s => s.Permissions)
                   .HasForeignKey(p => p.ScopeId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Evitar permisos duplicados bajo el mismo scope
            builder.HasIndex(p => new { p.Name, p.ScopeId })
                   .IsUnique();

            builder.HasIndex(p => p.ScopeId);
        }
    }
}