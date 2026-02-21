using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Krea.Domain.Entities;

namespace Krea.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .ValueGeneratedNever();

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.DisplayName)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(u => u.Biography)
            .HasMaxLength(256);

        builder.Property(u => u.LanguageCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(u => u.TimeZoneId)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(u => u.EmailConfirmed)
            .IsRequired();

        builder.Property(u => u.IsBanned)
            .IsRequired();

        builder.Property(u => u.IsDisabled)
            .IsRequired();

        builder.Property(u => u.RegisteredAt)
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .IsRequired();

        builder.HasIndex(u => u.Username)
            .IsUnique();

        builder.HasIndex(u => u.Email)
            .IsUnique();

        // Relacion con Posts
        builder.HasMany(u => u.Posts)
            .WithOne(p => p.AuthorPost)
            .HasForeignKey(p => p.AuthorPostId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(u => u.Posts)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        // Relacion con Likes
        builder.HasMany(u => u.Likes)
            .WithOne(l => l.User)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(u => u.Likes)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
        
        builder.HasMany(u => u.Collections)
            .WithOne(c => c.Owner)
            .HasForeignKey(c => c.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(u => u.Collections)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}