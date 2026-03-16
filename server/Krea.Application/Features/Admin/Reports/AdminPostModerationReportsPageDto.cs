namespace Krea.Application.Features.Admin.Reports {
    using Domain.ValueObjects;

    public sealed record AdminPostModerationReportsPageDto(
        int Page,
        int PageSize,
        int TotalCount,
        int TotalPages,
        PostModerationReportStatus? Status,
        IReadOnlyList<AdminPostModerationReportDto> Items
    );
}
