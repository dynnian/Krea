using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public class MembershipPlanConfiguration : IEntityTypeConfiguration<MembershipPlan>
{
    public void Configure(EntityTypeBuilder<MembershipPlan> builder)
    {
        builder.ToTable("membership_plan");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.PriceAmount)
            .HasColumnType("decimal(5,2)");

        builder.HasOne(m => m.Artist)
            .WithMany(u => u.MembershipPlans)
            .HasForeignKey(m => m.ArtistId);
    }
}
