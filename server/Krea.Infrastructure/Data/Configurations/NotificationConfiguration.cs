namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification> {
        public void Configure(EntityTypeBuilder<Notification> builder) {
            builder.ToTable("notifications");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedNever();

            builder.Property(x => x.Content)
                   .HasMaxLength(500)
                   .IsRequired();

            builder.Property(x => x.Type)
                   .HasConversion<int>()
                   .IsRequired();

            builder.Property(x => x.EntityType)
                   .HasConversion<int>();

            builder.Property(x => x.IsRead)
                   .IsRequired();

            builder.Property(x => x.CreatedAt)
                   .IsRequired();

            builder.Property(x => x.ReadAt);

            builder.HasIndex(x => x.UserId);
            builder.HasIndex(x => new { x.UserId, x.IsRead, x.CreatedAt });

            builder.HasOne(x => x.User)
                   .WithMany()
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ActorUser)
                   .WithMany()
                   .HasForeignKey(x => x.ActorUserId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}