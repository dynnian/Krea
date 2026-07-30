using Krea.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krea.Infrastructure.Data.Configurations {
    public sealed class PostModerationReportConfiguration : IEntityTypeConfiguration<PostModerationReport> {
        public void Configure(EntityTypeBuilder<PostModerationReport> builder) {
            builder.ToTable("post_moderation_reports");

            builder.HasKey(r => r.Id);
            builder.Property(r => r.Id).ValueGeneratedNever();

            builder.Property(r => r.Reason)
                   .IsRequired()
                   .HasMaxLength(256);

            builder.Property(r => r.Details)
                   .HasMaxLength(2000);

            builder.Property(r => r.ModeratorNote)
                   .HasMaxLength(1000);

            builder.Property(r => r.Status)
                   .HasConversion<int>()
                   .IsRequired();

            builder.Property(r => r.ResolvedAction)
                   .HasConversion<int?>();

            builder.Property(r => r.CreatedAt).IsRequired();
            builder.Property(r => r.UpdatedAt).IsRequired();

            builder.HasOne(r => r.Post)
                   .WithMany()
                   .HasForeignKey(r => r.PostId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.ReporterUser)
                   .WithMany()
                   .HasForeignKey(r => r.ReporterUserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(r => r.PostId);
            builder.HasIndex(r => r.ReporterUserId);
            builder.HasIndex(r => r.Status);
            builder.HasIndex(r => r.CreatedAt);
        }
    }
}