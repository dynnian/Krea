namespace Krea.Application.Features.Admin.Reports {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetAdminPostModerationReportsHandler
        : IRequestHandler<GetAdminPostModerationReportsQuery, AdminPostModerationReportsPageDto> {
        private readonly IPostModerationReportRepository _reportRepository;

        public GetAdminPostModerationReportsHandler(IPostModerationReportRepository reportRepository) =>
            _reportRepository = reportRepository;

        public async Task<AdminPostModerationReportsPageDto> Handle(
            GetAdminPostModerationReportsQuery request,
            CancellationToken cancellationToken) {
            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize is <= 0 or > 200 ? 20 : request.PageSize;

            int totalCount = await _reportRepository.CountAsync(request.Status, cancellationToken);
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

            IReadOnlyList<PostModerationReport> reports = await _reportRepository.GetPagedAsync(
                request.Status,
                page,
                pageSize,
                cancellationToken);

            IReadOnlyList<AdminPostModerationReportDto> items = reports
                                                                .Select(r => new AdminPostModerationReportDto(
                                                                    r.Id,
                                                                    r.PostId,
                                                                    r.Post.Title,
                                                                    r.ReporterUserId,
                                                                    r.ReporterUser.DisplayName,
                                                                    r.Reason,
                                                                    r.Details,
                                                                    r.Status,
                                                                    r.CreatedAt,
                                                                    r.ResolvedAt,
                                                                    r.ResolvedAction,
                                                                    r.ResolvedByUserId,
                                                                    r.ModeratorNote))
                                                                .ToList();

            return new AdminPostModerationReportsPageDto(
                page,
                pageSize,
                totalCount,
                totalPages,
                request.Status,
                items);
        }
    }
}