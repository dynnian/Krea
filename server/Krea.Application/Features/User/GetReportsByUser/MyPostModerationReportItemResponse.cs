namespace Krea.Application.Features.User.GetReportsByUser {
    using Domain.ValueObjects;

    public sealed class MyPostModerationReportItemResponse {
        public Guid ReportId { get; init; }
        public Guid PostId { get; init; }
        public string Reason { get; init; } = default!;
        public string? Details { get; init; }
        public PostModerationReportStatus Status { get; init; }
        public PostModerationDecisionAction? ResolvedAction { get; init; }
        public string? ModeratorNote { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
    }
}