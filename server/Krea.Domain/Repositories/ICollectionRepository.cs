using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    using Abstractions;

    public interface ICollectionRepository {
        Task<Collection?> GetByIdAsync(Guid id, CancellationToken ct = default);

        Task<Collection?> GetByIdWithPostsAsync(Guid id, CancellationToken ct = default);

        Task<IReadOnlyList<Collection>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default);

        Task AddAsync(Collection collection, CancellationToken ct = default);

        void Remove(Collection collection);

        Task<PaginatedList<Collection>> ExploreAsync(
            string? search,
            string? sortBy,
            int page,
            int pageSize,
            CancellationToken ct = default);
    }
}