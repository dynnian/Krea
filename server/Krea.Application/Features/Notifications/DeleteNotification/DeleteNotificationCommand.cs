namespace Krea.Application.Features.Notifications.DeleteNotification {
    using Domain.Abstractions;

    public sealed record DeleteNotificationCommand(Guid UserId, Guid NotificationId) : IRequest<Unit>;
}