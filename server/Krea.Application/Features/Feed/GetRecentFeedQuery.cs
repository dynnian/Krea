namespace Krea.Application.Features.Feed {
    public sealed record GetRecentFeedQuery(
        Guid? CurrentUserId,
        int Page,
        int PageSize
    );
}