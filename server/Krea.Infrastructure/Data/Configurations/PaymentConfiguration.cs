using Krea.Domain.Entities;
using Krea.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations {
    public sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment> {
        public void Configure(EntityTypeBuilder<Payment> builder) {
            builder.ToTable("payments");

            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).ValueGeneratedNever();

            builder.Property<Guid>("PayerId");
            builder.HasOne(p => p.Payer)
                   .WithMany()
                   .HasForeignKey("PayerId")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property<Guid?>("SubscriptionId");
            builder.HasOne(p => p.Subscription)
                   .WithMany(s => s.Payments)
                   .HasForeignKey("SubscriptionId")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property<Guid?>("DonationId");
            builder.HasOne(p => p.Donation)
                   .WithMany(d => d.Payments)
                   .HasForeignKey("DonationId")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property<Guid?>("CommissionRequestId");
            builder.HasOne(p => p.CommissionRequest)
                   .WithMany(c => c.Payments)
                   .HasForeignKey("CommissionRequestId")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.ComplexProperty(p => p.Amount, money =>
            {
                money.Property(m => m.Amount)
                    .HasColumnName("amount")
                    .HasColumnType("decimal(18,2)");

                money.Property(m => m.Currency)
                    .HasColumnName("currency")
                    .HasMaxLength(3);
            });

            builder.OwnsOne(p => p.ExternalRef, ext => {
                ext.Property(e => e.Provider)
                    .HasColumnName("external_ref_provider")
                    .HasMaxLength(20)
                    .IsRequired();
                ext.Property(e => e.Value)
                   .HasColumnName("external_ref_value")
                   .HasMaxLength(128)
                   .IsRequired();
            });

            builder.Property(p => p.Status)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(p => p.PaidAt).IsRequired(false);

            // Índices
            builder.HasIndex("SubscriptionId");
            builder.HasIndex("DonationId");
            builder.HasIndex("CommissionRequestId");
            builder.HasIndex("PayerId");

            // Constraint
            builder.ToTable(tb => tb.HasCheckConstraint("CK_Payment_SingleTarget", @"
            (CASE WHEN ""SubscriptionId"" IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN ""DonationId"" IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN ""CommissionRequestId"" IS NOT NULL THEN 1 ELSE 0 END) = 1
        "));
        }
    }
}