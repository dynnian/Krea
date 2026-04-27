namespace Krea.Domain.Repositories {
    using Entities;

    public interface INotificationGlobalPreferenceRepository {
        Task<NotificationGlobalPreference?> GetByUserAsync(Guid userId, CancellationToken cancellationToken);
        Task AddAsync(NotificationGlobalPreference preference, CancellationToken cancellationToken);
    }
}