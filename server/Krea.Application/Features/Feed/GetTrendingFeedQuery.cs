namespace Krea.Application.Features.Posts.Dto {
    public sealed record GetTrendingFeedQuery(
        Guid CurrentUserId,
        int Page,
        int PageSize
    );
}