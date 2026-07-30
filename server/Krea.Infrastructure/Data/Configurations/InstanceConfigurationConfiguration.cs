using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations {
    public sealed class InstanceConfigurationConfiguration : IEntityTypeConfiguration<InstanceConfiguration> {
        public void Configure(EntityTypeBuilder<InstanceConfiguration> builder) {
            builder.ToTable("instance_configuration");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedNever();

            builder.Property(x => x.PlatformName)
                   .IsRequired()
                   .HasMaxLength(128);

            builder.Property(x => x.Description)
                   .IsRequired()
                   .HasMaxLength(512);

            builder.Property(x => x.AdministratorEmail)
                   .IsRequired()
                   .HasMaxLength(256);

            builder.Property(x => x.UpdatedAt)
                   .IsRequired();
        }
    }
}