using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations;

public class CommissionOfferingConfiguration : IEntityTypeConfiguration<CommissionOffering>
{
    public void Configure(EntityTypeBuilder<CommissionOffering> builder)
    {
        builder.ToTable("commission_offerings");

        builder.HasKey(co => co.Id);

        builder.Property(co => co.Id)
            .ValueGeneratedNever();

        builder.Property(co => co.Title)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(co => co.Description)
            .HasMaxLength(1000);

        builder.Property(co => co.Price)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.HasOne(co => co.Creator)
            .WithMany(u => u.CommissionOfferings)
            .HasForeignKey(co => co.CreatorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
