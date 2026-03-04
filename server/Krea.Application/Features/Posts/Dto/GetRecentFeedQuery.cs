namespace Krea.Application.Features.Posts.Dto {
    public sealed record GetRecentFeedQuery(
        Guid CurrentUserId,
        int Page,
        int PageSize
    );
}