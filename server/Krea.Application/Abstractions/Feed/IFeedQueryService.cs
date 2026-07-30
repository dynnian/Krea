namespace Krea.Application.Abstractions.Feed {
    using Features.Posts.Dto;

    public interface IFeedQueryService {
        Task<IReadOnlyList<PostFeedResponse>> GetRecentAsync(
            Guid? currentUserId,
            int page,
            int pageSize,
            CancellationToken ct);

        Task<IReadOnlyList<PostFeedResponse>> GetFollowingFeedAsync(
            Guid currentUserId,
            int page,
            int pageSize,
            CancellationToken ct);

        Task<IReadOnlyList<PostFeedResponse>> GetTrendingAsync(
            Guid? currentUserId,
            int page,
            int pageSize,
            CancellationToken ct);
    }
}