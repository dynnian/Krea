using Krea.Domain.Entities;
using Krea.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public sealed class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {

        builder.Property(u => u.Id).ValueGeneratedNever();
        
        builder.HasOne<AppUser>()
            .WithOne()
            .HasForeignKey<User>(u => u.Id)
            .HasPrincipalKey<AppUser>(au => au.Id)
            .OnDelete(DeleteBehavior.Cascade);
    }
}