namespace Krea.Application.Features.Admin.Reports {
    using Domain.ValueObjects;

    public sealed record AdminPostModerationReportDto(
        Guid Id,
        Guid PostId,
        string PostTitle,
        Guid ReporterUserId,
        string ReporterDisplayName,
        string Reason,
        string? Details,
        PostModerationReportStatus Status,
        DateTime CreatedAt,
        DateTime? ResolvedAt,
        PostModerationDecisionAction? ResolvedAction,
        Guid? ResolvedByUserId,
        string? ModeratorNote
    );
}
