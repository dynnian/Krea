using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public sealed class DonationConfiguration 
    : IEntityTypeConfiguration<Donation>
{
    public void Configure(EntityTypeBuilder<Donation> builder)
    {
        builder.ToTable("donations");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Id)
            .ValueGeneratedNever();

        builder.Property(d => d.Amount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(d => d.Message)
            .HasMaxLength(500);

        builder.Property(d => d.DonatedAt)
            .IsRequired();

        builder.HasOne(d => d.Donor)
            .WithMany()
            .HasForeignKey("DonorId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Recipient)
            .WithMany()
            .HasForeignKey("RecipientId")
            .OnDelete(DeleteBehavior.Restrict);
    }
}