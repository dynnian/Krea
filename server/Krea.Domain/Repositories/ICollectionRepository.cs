using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface ICollectionRepository
    {
        Task<Collection?> GetByIdAsync(Guid id, CancellationToken ct = default);

        Task<IReadOnlyList<Collection>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default);

        Task AddAsync(Collection collection, CancellationToken ct = default);

        void Remove(Collection collection);
    }
}