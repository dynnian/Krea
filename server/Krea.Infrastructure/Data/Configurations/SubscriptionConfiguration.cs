namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription> {
        public void Configure(EntityTypeBuilder<Subscription> builder) {
            builder.ToTable("subscriptions");

            builder.HasKey(s => s.Id);
            builder.Property(s => s.Id).ValueGeneratedNever();

            builder.Property(s => s.IsActive).IsRequired();
            builder.Property(s => s.CurrentPeriodStart).IsRequired();
            builder.Property(s => s.CurrentPeriodEnd).IsRequired();
            builder.Property(s => s.SubscribedAt).IsRequired();
            builder.Property(s => s.UpdatedAt).IsRequired();
            builder.Property(s => s.CanceledAt);

            builder.Property<Guid>("SubscriberId");
            builder.HasOne(s => s.Subscriber)
                   .WithMany()
                   .HasForeignKey("SubscriberId")
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Property<Guid>("PlanId");
            builder.HasOne(s => s.Plan)
                   .WithMany()
                   .HasForeignKey("PlanId")
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(s => s.Payments)
                   .WithOne(p => p.Subscription)
                   .HasForeignKey("SubscriptionId")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Metadata.FindNavigation(nameof(Subscription.Payments))
                   ?.SetPropertyAccessMode(PropertyAccessMode.Field);
        }
    }
}