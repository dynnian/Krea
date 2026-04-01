namespace Krea.Application.Features.User.GetReportsByUser {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetMyPostModerationReportsHandler
        : IRequestHandler<GetMyPostModerationReportsQuery, GetMyPostModerationReportsResponse>
    {
        private readonly IPostModerationReportRepository _reportRepository;

        public GetMyPostModerationReportsHandler(IPostModerationReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        public async Task<GetMyPostModerationReportsResponse> Handle(
            GetMyPostModerationReportsQuery request,
            CancellationToken cancellationToken)
        {
            if (request.ReporterUserId == Guid.Empty)
                throw new ArgumentException("ReporterUserId is required.", nameof(request.ReporterUserId));

            if (request.Page <= 0)
                throw new ArgumentException("Page must be greater than 0.", nameof(request.Page));

            if (request.PageSize <= 0)
                throw new ArgumentException("PageSize must be greater than 0.", nameof(request.PageSize));

            int totalCount = await _reportRepository.CountByReporterAsync(
                request.ReporterUserId,
                cancellationToken);

            IReadOnlyList<PostModerationReport> reports = await _reportRepository.GetByReporterPagedAsync(
                request.ReporterUserId,
                request.Page,
                request.PageSize,
                cancellationToken);

            return new GetMyPostModerationReportsResponse
            {
                Page = request.Page,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = reports.Select(r => new MyPostModerationReportItemResponse
                {
                    ReportId = r.Id,
                    PostId = r.PostId,
                    Reason = r.Reason,
                    Details = r.Details,
                    Status = r.Status,
                    ResolvedAction = r.ResolvedAction,
                    ModeratorNote = r.ModeratorNote,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt
                }).ToList()
            };
        }
    }
}