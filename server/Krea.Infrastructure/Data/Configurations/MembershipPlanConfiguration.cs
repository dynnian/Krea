using Krea.Domain.Entities;
using Krea.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations {
    public sealed class MembershipPlanConfiguration
        : IEntityTypeConfiguration<MembershipPlan> {
        public void Configure(EntityTypeBuilder<MembershipPlan> builder) {
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

            // Media as owned
            builder.OwnsOne(p => p.Image, media => {
                media.Property(m => m.Id)
                     .HasColumnName("image_id");

                media.Property(m => m.OriginalFileName)
                     .HasColumnName("image_original_name");

                media.Property(m => m.FileName)
                     .HasColumnName("image_file_name");

                media.Property(m => m.MimeType)
                     .HasColumnName("image_mime_type");

                media.Property(m => m.Path)
                     .HasColumnName("image_path");

                media.Property(m => m.UploadedAt)
                     .HasColumnName("image_uploaded_at");
            });
        }
    }
}