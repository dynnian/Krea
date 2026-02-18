using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public class CommissionRequestConfiguration : IEntityTypeConfiguration<CommissionRequest>
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
            .HasConversion<int>()
            .IsRequired();

        builder.HasOne(cr => cr.Requester)
            .WithMany(u => u.CommissionRequests)
            .HasForeignKey(cr => cr.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cr => cr.Offering)
            .WithMany(o => o.Requests)
            .HasForeignKey(cr => cr.OfferingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
