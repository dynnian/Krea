using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations {
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken> {
        public void Configure(EntityTypeBuilder<RefreshToken> builder) {
            builder.ToTable("refresh_tokens");

            builder.HasKey(rt => rt.Id);

            builder.Property(rt => rt.Token)
                   .HasColumnName("token")
                   .HasMaxLength(256)
                   .IsRequired();

            builder.HasIndex(rt => rt.Token)
                   .IsUnique(); // Asegura que no haya tokens duplicados

            builder.Property(rt => rt.UserId)
                   .HasColumnName("user_id")
                   .IsRequired();

            builder.Property(rt => rt.ExpiresAt)
                   .HasColumnName("expires_at")
                   .IsRequired();

            builder.Property(rt => rt.IsRevoked)
                   .HasColumnName("is_revoked")
                   .IsRequired();

            builder.Property(rt => rt.IsUsed)
                   .HasColumnName("is_used")
                   .IsRequired();

            builder.Property(rt => rt.ReplacedByToken)
                   .HasColumnName("replaced_by_token")
                   .HasMaxLength(256)
                   .IsRequired(false);

            builder.Property(rt => rt.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired();

            builder.Property(rt => rt.RevokedAt)
                   .HasColumnName("revoked_at")
                   .IsRequired(false);

            // Índices para consultas rápidas
            builder.HasIndex(rt => rt.UserId);
            builder.HasIndex(rt => rt.ExpiresAt);
        }
    }
}