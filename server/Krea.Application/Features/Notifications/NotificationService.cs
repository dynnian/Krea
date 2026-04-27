namespace Krea.Application.Features.Notifications {
    using Abstractions.Notification;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Dto;

    public sealed class NotificationService : INotificationService {
        private readonly INotificationRepository _notifications;
        private readonly INotificationPreferenceRepository _preferences;
        private readonly INotificationGlobalPreferenceRepository _globalPreferences;
        private readonly INotificationStream _stream;
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(
            INotificationRepository notifications,
            INotificationPreferenceRepository preferences,
            INotificationGlobalPreferenceRepository globalPreferences,
            INotificationStream stream,
            IUnitOfWork unitOfWork) {
            _notifications = notifications;
            _preferences = preferences;
            _globalPreferences = globalPreferences;
            _stream = stream;
            _unitOfWork = unitOfWork;
        }

        public async Task NotifyAsync(
            Guid recipientUserId,
            Guid? actorUserId,
            NotificationType type,
            string content,
            Guid? entityId,
            NotificationEntityType? entityType,
            CancellationToken cancellationToken) {
            if (recipientUserId == Guid.Empty)
                return;

            if (actorUserId.HasValue && actorUserId.Value == recipientUserId)
                return;

            NotificationGlobalPreference? global =
                await _globalPreferences.GetByUserAsync(recipientUserId, cancellationToken);

            if (global is not null && global.AllNotificationsPaused)
                return;

            NotificationPreference? preference =
                await _preferences.GetByUserAndTypeAsync(recipientUserId, type, cancellationToken);

            if (preference is null) {
                preference = new NotificationPreference(recipientUserId, type);
                await _preferences.AddAsync(preference, cancellationToken);
            }

            if (preference.IsPaused || !preference.InAppEnabled) {
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return;
            }

            var notification = new Notification(
                recipientUserId,
                actorUserId,
                type,
                content,
                entityId,
                entityType);

            await _notifications.AddAsync(notification, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _stream.PublishAsync(recipientUserId,
                new NotificationEventDto {
                    Id = notification.Id,
                    UserId = notification.UserId,
                    ActorUserId = notification.ActorUserId,
                    Type = (int)notification.Type,
                    EntityId = notification.EntityId,
                    EntityType = notification.EntityType is null ? null : (int)notification.EntityType.Value,
                    Content = notification.Content,
                    IsRead = notification.IsRead,
                    CreatedAt = notification.CreatedAt
                }, cancellationToken);

            // TODO luego para enganchar email si preference.EmailEnabled == true
        }
    }
}