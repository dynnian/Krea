namespace Krea.Infrastructure.Data.Configurations {

    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class FollowConfiguration : IEntityTypeConfiguration<Follow> {
        public void Configure(EntityTypeBuilder<Follow> builder) {
            builder.ToTable("follows");

            builder.HasKey(f => f.Id);

            builder.Property(f => f.Id)
                .ValueGeneratedNever();

            builder.Property(f => f.FollowedAt)
                .IsRequired();

            builder.HasOne(f => f.Source)
                .WithMany()
                .HasForeignKey(f => f.SourceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(f => f.Target)
                .WithMany()
                .HasForeignKey(f => f.TargetId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(f => new { f.SourceId, f.TargetId })
                .IsUnique();
        }
    }
}

