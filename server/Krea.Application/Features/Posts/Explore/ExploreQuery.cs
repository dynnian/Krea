namespace Krea.Application.Features.Posts.Explore {
    using Domain.Abstractions;
    using Dto;

    public sealed record ExploreQuery(
        string? Category,
        List<string>? Genres,
        List<string>? Tags,
        string? SortBy,
        int Page = 1,
        int PageSize = 10,
        Guid? CurrentUserId = null
    ) : IRequest<PagedResult<ExplorePostDto>>;
}