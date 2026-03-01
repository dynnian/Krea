namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Domain.ValueObjects;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class CommissionOfferingConfiguration
        : IEntityTypeConfiguration<CommissionOffering> {
        public void Configure(EntityTypeBuilder<CommissionOffering> builder) {
            builder.ToTable("commission_offerings");

            builder.HasKey(o => o.Id);

            builder.Property(o => o.Id)
                   .ValueGeneratedNever();

            builder.Property(o => o.Title)
                   .IsRequired()
                   .HasMaxLength(25);

            builder.Property(o => o.Description)
                   .HasMaxLength(2000);

            builder.Property(o => o.MaxSlots)
                   .IsRequired();

            builder.Property(o => o.IsActive)
                   .IsRequired();

            builder.Property(o => o.CreatedAt)
                   .IsRequired();

            builder.Property(o => o.BasePrice)
                   .HasConversion(
                       m => m.Amount,
                       v => new Money(v))
                   .HasColumnName("base_price")
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.HasOne(o => o.Artist)
                   .WithMany()
                   .HasForeignKey("ArtistId")
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}