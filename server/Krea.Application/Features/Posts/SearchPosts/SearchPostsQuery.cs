namespace Krea.Application.Features.Posts.SearchPosts {
    using Domain.Abstractions;
    using Dto;

    public sealed record SearchPostsQuery(
        string Query,
        int Page = 1,
        int PageSize = 20
    ) : IRequest<PaginatedList<PostSearchItemDto>>;
}