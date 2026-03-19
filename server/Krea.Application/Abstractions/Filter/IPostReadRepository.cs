namespace Krea.Application.Abstractions.Filter {
    using Features.Posts.Dto;
    using Features.Posts.Explore;

    public interface IPostReadRepository
    {
        Task<PagedResult<ExplorePostDto>> ExploreAsync(
            ExploreQuery query,
            CancellationToken cancellationToken);
    }
}