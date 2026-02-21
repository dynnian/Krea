using Krea.Domain.Entities;
using Krea.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
               .ValueGeneratedNever();

        builder.HasOne(p => p.Payer)
               .WithMany()
               .HasForeignKey("PayerId")
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Payee)
               .WithMany()
               .HasForeignKey("PayeeId")
               .OnDelete(DeleteBehavior.Restrict);

        builder.Property(p => p.Amount)
               .HasConversion(
                      money => money.Amount,
                      value => new Money(value))
               .HasColumnName("amount")
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.OwnsOne(p => p.ExternalRef, ext =>
        {
            ext.Property(e => e.Value)
               .HasColumnName("external_ref")
               .HasMaxLength(128)
               .IsRequired();
        });

        builder.Property(p => p.Status)
               .HasConversion<string>()
               .HasMaxLength(20)
               .IsRequired();

        builder.Property(p => p.PayedAt)
               .IsRequired(false);
    }
}