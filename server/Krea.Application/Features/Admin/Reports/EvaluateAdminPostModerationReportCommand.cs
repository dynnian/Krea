namespace Krea.Application.Features.Admin.Reports {
    using Domain.Abstractions;
    using Domain.ValueObjects;

    public sealed record EvaluateAdminPostModerationReportCommand(
        Guid ActorUserId,
        Guid ReportId,
        PostModerationDecisionAction Action,
        string? ModeratorNote
    ) : IRequest<Unit>;
}