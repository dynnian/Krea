using Krea.Domain.Entities;

namespace Krea.Domain.Repositories;

public interface ICollectionsRepository
{
    Task<Collections?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Collections?> GetWithPostsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IEnumerable<Collections>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);

    Task AddAsync(Collections collection, CancellationToken cancellationToken = default);

    Task UpdateAsync(Collections collection, CancellationToken cancellationToken = default);

    Task DeleteAsync(Collections collection, CancellationToken cancellationToken = default);
}