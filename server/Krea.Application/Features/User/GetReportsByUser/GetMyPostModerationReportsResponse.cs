namespace Krea.Application.Features.User.GetReportsByUser {
    public sealed class GetMyPostModerationReportsResponse {
        public IReadOnlyList<MyPostModerationReportItemResponse> Items { get; init; } = [];
        public int Page { get; init; }
        public int PageSize { get; init; }
        public int TotalCount { get; init; }
    }
}