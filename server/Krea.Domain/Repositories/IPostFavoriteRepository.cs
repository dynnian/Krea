namespace Krea.Domain.Repositories {
    using Abstractions;
    using Entities;

    public interface IPostFavoriteRepository {
        Task<bool> ExistsAsync(Guid userId, Guid postId);

        Task AddAsync(PostFavorite favorite, CancellationToken ct);

        Task<PostFavorite?> GetByUserAndPostAsync(Guid userId, Guid postId);

        void Delete(PostFavorite favorite);

        Task<PaginatedList<Post>> GetUserFavoritesAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken ct);

        Task<HashSet<Guid>> GetFavoritePostIdsAsync(
            Guid userId,
            IReadOnlyCollection<Guid> postIds,
            CancellationToken ct);
    }
}