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

        void Remove(Follow follow);
    }
}