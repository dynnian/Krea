namespace Krea.Domain.Repositories {
    using Entities;

    public interface INotificationRepository {
        Task AddAsync(Notification notification, CancellationToken cancellationToken);
        Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<IReadOnlyList<Notification>> GetByUserAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        Task<int> CountUnreadAsync(Guid userId, CancellationToken cancellationToken);
        Task<IReadOnlyList<Notification>> GetUnreadByUserAsync(Guid userId, CancellationToken cancellationToken);
        Task DeleteAsync(Notification notification, CancellationToken cancellationToken);
    }
}