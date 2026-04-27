namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class NotificationGlobalPreferenceConfiguration
        : IEntityTypeConfiguration<NotificationGlobalPreference> {
        public void Configure(EntityTypeBuilder<NotificationGlobalPreference> builder) {
            builder.ToTable("notification_global_preferences");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedNever();

            builder.Property(x => x.AllNotificationsPaused)
                   .IsRequired();

            builder.Property(x => x.CreatedAt)
                   .IsRequired();

            builder.Property(x => x.UpdatedAt)
                   .IsRequired();

            builder.HasIndex(x => x.UserId)
                   .IsUnique();

            builder.HasOne(x => x.User)
                   .WithMany()
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}