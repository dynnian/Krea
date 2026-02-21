using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public sealed class CommissionRequestConfiguration 
    : IEntityTypeConfiguration<CommissionRequest>
{
    public void Configure(EntityTypeBuilder<CommissionRequest> builder)
    {
        builder.ToTable("commission_requests");

        builder.HasKey(cr => cr.Id);

        builder.Property(cr => cr.Id)
            .ValueGeneratedNever();

        builder.Property(cr => cr.Brief)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(cr => cr.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(cr => cr.CreatedAt)
            .IsRequired();

        builder.Property(cr => cr.UpdatedAt)
            .IsRequired();

        builder.HasOne(cr => cr.Bidder)
            .WithMany()
            .HasForeignKey("BidderId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cr => cr.Offering)
            .WithMany()
            .HasForeignKey("OfferingId")
            .OnDelete(DeleteBehavior.Cascade);
    }
}