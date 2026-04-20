namespace Krea.Application.Features.Notifications.MarkAllNotificationsAsRead {
    using Domain.Abstractions;

    public sealed record MarkAllNotificationsAsReadCommand(Guid UserId) : IRequest<Unit>;
}