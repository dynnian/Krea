using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    using Abstractions;

    public interface IUserRepository {
        Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<User>> GetByIdsAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<int> CountAsync(CancellationToken cancellationToken = default);
        Task<int> CountActiveSinceAsync(DateTime fromUtc, CancellationToken cancellationToken = default);
        Task<int> CountSuspendedAsync(CancellationToken cancellationToken = default);
        Task<int> CountBannedAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<User>> GetRecentlyRegisteredAsync(int take, CancellationToken cancellationToken = default);
        Task AddAsync(User user, CancellationToken cancellationToken = default);
        Task UpdateAsync(User user, CancellationToken cancellationToken = default);
        Task RemoveAsync(User user, CancellationToken cancellationToken = default);
        Task<User?> GetByIdWithPicturesAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<User>> SearchByDisplayNameAsync(
            string query,
            CancellationToken cancellationToken = default);
    }
}