namespace Krea.Application.Features.Notifications.MarkNotificationAsRead {
    using Domain.Abstractions;

    public sealed record MarkNotificationAsReadCommand(Guid UserId, Guid NotificationId) : IRequest<Unit>;
}