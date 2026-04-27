namespace Krea.Domain.Repositories {
    using Entities;
    using ValueObjects;

    public interface INotificationPreferenceRepository {
        Task<NotificationPreference?> GetByUserAndTypeAsync(
            Guid userId,
            NotificationType type,
            CancellationToken cancellationToken);

        Task<IReadOnlyList<NotificationPreference>> GetByUserAsync(
            Guid userId,
            CancellationToken cancellationToken);

        Task AddAsync(NotificationPreference preference, CancellationToken cancellationToken);
    }
}