namespace Krea.Infrastructure.Data.Configurations
{
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class SubmissionFeedbackConfiguration : IEntityTypeConfiguration<SubmissionFeedback>
    {
        public void Configure(EntityTypeBuilder<SubmissionFeedback> builder)
        {
            builder.ToTable("submission_feedback");

            builder.HasKey(f => f.Id);

            builder.Property(f => f.Id).ValueGeneratedNever();

            builder.Property(f => f.Content)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(f => f.CreatedAt).IsRequired();
            builder.Property(f => f.UpdatedAt).IsRequired();

            builder.HasOne(f => f.Submission)
                .WithMany(s => s.Feedback)
                .HasForeignKey(f => f.SubmissionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(f => f.Author)
                .WithMany()
                .HasForeignKey(f => f.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(f => f.SubmissionId);
            builder.HasIndex(f => f.AuthorId);
        }
    }
}