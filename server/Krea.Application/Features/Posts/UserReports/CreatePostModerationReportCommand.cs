namespace Krea.Application.Features.Posts.UserReports {
    using Domain.Abstractions;

    public sealed record CreatePostModerationReportCommand(
        Guid PostId,
        Guid ReporterUserId,
        string Reason,
        string? Details
    ) : IRequest<CreatePostModerationReportResponse>;
}