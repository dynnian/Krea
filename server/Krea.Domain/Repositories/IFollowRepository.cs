namespace Krea.Domain.Repositories {
    using Entities;

    public interface IFollowRepository {
        Task<bool> ExistsAsync(
            Guid sourceId,
            Guid targetId,
            CancellationToken cancellationToken);

        Task<Follow?> GetAsync(
            Guid sourceId,
            Guid targetId,
            CancellationToken cancellationToken);

        Task AddAsync(
            Follow follow,
            CancellationToken cancellationToken);

        Task<int> CountAsync(CancellationToken cancellationToken);

        Task<IReadOnlyList<Follow>> GetRecentAsync(int take, CancellationToken cancellationToken);

        void Remove(Follow follow);

        Task<int> GetFollowersCountAsync(Guid userId, CancellationToken cancellationToken);

        Task<int> GetFollowingCountAsync(Guid userId, CancellationToken cancellationToken);

        Task<IReadOnlyList<Follow>> GetFollowersPageAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        Task<IReadOnlyList<Follow>> GetFollowingPageAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        Task<HashSet<Guid>> GetFollowedTargetIdsAsync(
            Guid sourceId,
            IReadOnlyCollection<Guid> candidateTargetIds,
            CancellationToken cancellationToken);
    }
}