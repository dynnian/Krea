namespace Krea.Application.Features.Feed {
    public sealed record GetFollowingFeedQuery(
        Guid? CurrentUserId,
        int Page = 1,
        int PageSize = 20
    );
}