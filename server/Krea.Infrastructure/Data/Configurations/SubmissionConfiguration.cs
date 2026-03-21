namespace Krea.Infrastructure.Data.Configurations {
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class SubmissionConfiguration
        : IEntityTypeConfiguration<Submission> {
        
        public void Configure(EntityTypeBuilder<Submission> builder) {
            builder.ToTable("submissions");

            builder.HasKey(s => s.Id);

            builder.HasOne(s => s.Request)
                .WithMany(s => s.Submissions)
                .HasForeignKey(s => s.RequestId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Media)
                .WithOne()
                .HasForeignKey<Submission>(s => s.MediaId)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(s => s.Feedback)
                .WithOne(f => f.Submission)
                .HasForeignKey(f => f.SubmissionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Metadata.FindNavigation(nameof(Submission.Feedback))
                ?.SetPropertyAccessMode(PropertyAccessMode.Field);

            builder.HasIndex(s => s.MediaId).IsUnique();
        }
    }
}