namespace Krea.Application.Abstractions.Notification {
    using Features.Notifications.Dto;
    using System.Threading.Channels;

    public interface INotificationStream {
        ChannelReader<NotificationEventDto> Subscribe(Guid userId, CancellationToken cancellationToken);
        Task PublishAsync(Guid userId, NotificationEventDto notification, CancellationToken cancellationToken);
    }
}