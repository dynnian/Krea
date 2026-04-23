namespace Krea.Application.Features.Admin.Reports {
    using Domain.Abstractions;
    using Domain.ValueObjects;

    public sealed record GetAdminPostModerationReportsQuery(
        PostModerationReportStatus? Status,
        int Page,
        int PageSize
    ) : IRequest<AdminPostModerationReportsPageDto>;
}