using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).ValueGeneratedNever();

        builder.Property(u => u.DisplayName)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(u => u.Biography)
            .HasMaxLength(256);

        builder.Property(u => u.LanguageCode)
            .IsRequired()
            .HasMaxLength(10); // Ajusta según tus códigos

        builder.Property(u => u.TimeZoneId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.IsBanned)
            .IsRequired();

        builder.Property(u => u.IsDisabled)
            .IsRequired();

        builder.Property(u => u.RegisteredAt)
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .IsRequired();

        builder.Property(u => u.LastLoginAt);
        
        builder.HasOne(u => u.ProfilePicture)
            .WithMany()
            .HasForeignKey("ProfilePictureId")
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.HasOne(u => u.BannerPicture)
            .WithMany()
            .HasForeignKey("BannerPictureId")
            .OnDelete(DeleteBehavior.SetNull);
    }
}