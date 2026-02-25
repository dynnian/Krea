using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface ICollectionRepository {
        Task<Collection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<Collection?> GetWithPostsAsync(Guid id, CancellationToken cancellationToken = default);

        Task<IEnumerable<Collection>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);

        Task AddAsync(Collection collection, CancellationToken cancellationToken = default);

        Task UpdateAsync(Collection collection, CancellationToken cancellationToken = default);

        Task DeleteAsync(Collection collection, CancellationToken cancellationToken = default);
    }
}