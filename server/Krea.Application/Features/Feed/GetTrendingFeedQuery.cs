namespace Krea.Application.Features.Feed {
    public sealed record GetTrendingFeedQuery(
        Guid? CurrentUserId,
        int Page,
        int PageSize
    );
}