using Krea.Domain.Entities;
using Krea.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public sealed class MembershipPlanConfiguration 
    : IEntityTypeConfiguration<MembershipPlan>
{
    public void Configure(EntityTypeBuilder<MembershipPlan> builder)
    {
        builder.ToTable("membership_plans");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .ValueGeneratedNever();

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(p => p.Benefits)
            .IsRequired();

        builder.Property(p => p.MaxSlots)
            .IsRequired();

        builder.Property(p => p.IsActive)
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.UpdatedAt)
            .IsRequired();

        builder.Property(p => p.PriceAmount)
            .HasConversion(
                money => money.Amount,
                value => new Money(value))
            .HasColumnName("price_amount")
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        // Artist relationship
        builder.Property<Guid>("ArtistId");

        builder.HasOne(p => p.Artist)
            .WithMany()
            .HasForeignKey("ArtistId")
            .OnDelete(DeleteBehavior.Cascade);
        
        // Media
        builder.HasOne(p => p.Image)
            .WithOne()
            .HasForeignKey<MembershipPlan>("ImageId")
            .OnDelete(DeleteBehavior.SetNull);;
    }
}