namespace Krea.Application.Features.Posts.Dto {
    public sealed record GetFollowingFeedQuery(
        Guid CurrentUserId,
        int Page = 1,
        int PageSize = 20
    );
}