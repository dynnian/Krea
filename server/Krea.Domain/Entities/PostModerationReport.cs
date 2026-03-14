using System.ComponentModel.DataAnnotations;
using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class PostModerationReport {
        [Key]
        public Guid Id { get; private set; }

        public Guid PostId { get; private set; }
        public Post Post { get; private set; }

        public Guid ReporterUserId { get; private set; }
        public User ReporterUser { get; private set; }

        [StringLength(256)]
        public string Reason { get; private set; }

        [StringLength(2000)]
        public string? Details { get; private set; }

        public PostModerationReportStatus Status { get; private set; }
        public PostModerationDecisionAction? ResolvedAction { get; private set; }

        public Guid? ResolvedByUserId { get; private set; }
        public DateTime? ResolvedAt { get; private set; }

        [StringLength(1000)]
        public string? ModeratorNote { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

#pragma warning disable CS8618
        private PostModerationReport() { }
#pragma warning restore CS8618

        public PostModerationReport(Guid postId, Guid reporterUserId, string reason, string? details = null) {
            if (postId == Guid.Empty)
                throw new ArgumentException("PostId is required.", nameof(postId));

            if (reporterUserId == Guid.Empty)
                throw new ArgumentException("ReporterUserId is required.", nameof(reporterUserId));

            if (string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("Reason is required.", nameof(reason));

            Id = Guid.NewGuid();
            PostId = postId;
            ReporterUserId = reporterUserId;
            Reason = reason.Trim();
            Details = string.IsNullOrWhiteSpace(details) ? null : details.Trim();
            Status = PostModerationReportStatus.Pending;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void Resolve(PostModerationDecisionAction action, Guid resolvedByUserId, string? moderatorNote = null) {
            if (Status == PostModerationReportStatus.Resolved)
                throw new InvalidOperationException("Report has already been resolved.");

            if (resolvedByUserId == Guid.Empty)
                throw new ArgumentException("ResolvedByUserId is required.", nameof(resolvedByUserId));

            Status = PostModerationReportStatus.Resolved;
            ResolvedAction = action;
            ResolvedByUserId = resolvedByUserId;
            ResolvedAt = DateTime.UtcNow;
            ModeratorNote = string.IsNullOrWhiteSpace(moderatorNote) ? null : moderatorNote.Trim();
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
