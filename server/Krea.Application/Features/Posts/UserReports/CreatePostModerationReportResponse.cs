namespace Krea.Application.Features.Posts.UserReports {
    using Domain.ValueObjects;

    public sealed record CreatePostModerationReportResponse(
        Guid ReportId,
        Guid PostId,
        Guid ReporterUserId,
        string Reason,
        string? Details,
        PostModerationReportStatus Status,
        DateTime CreatedAt
    );
}