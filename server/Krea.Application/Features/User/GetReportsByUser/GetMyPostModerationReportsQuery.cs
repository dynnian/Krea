namespace Krea.Application.Features.User.GetReportsByUser {
    using Domain.Abstractions;

    public sealed record GetMyPostModerationReportsQuery(
        Guid ReporterUserId,
        int Page,
        int PageSize
    ) : IRequest<GetMyPostModerationReportsResponse>;}