namespace Krea.Application.Abstractions.Notification {
    using Domain.ValueObjects;

    public interface INotificationService
    {
        Task NotifyAsync(
            Guid recipientUserId,
            Guid? actorUserId,
            NotificationType type,
            string content,
            Guid? entityId,
            NotificationEntityType? entityType,
            CancellationToken cancellationToken);
    }
}