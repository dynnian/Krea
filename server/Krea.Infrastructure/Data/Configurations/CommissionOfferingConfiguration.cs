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

            builder.ComplexProperty(o => o.BasePrice, money => {
                money.Property(m => m.Amount)
                     .HasColumnName("amount")
                     .HasColumnType("decimal(18,2)");

                money.Property(m => m.Currency)
                     .HasColumnName("currency")
                     .HasMaxLength(3);
            });

            builder.HasOne(o => o.Artist)
                   .WithMany()
                   .HasForeignKey("ArtistId")
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}