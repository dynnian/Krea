namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Notification;
    using Application.Features.Notifications.Dto;
    using System.Collections.Concurrent;
    using System.Threading.Channels;

    public sealed class InMemoryNotificationStream : INotificationStream {
        private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<Guid, Channel<NotificationEventDto>>>
            _connections = new();

        public ChannelReader<NotificationEventDto> Subscribe(Guid userId, CancellationToken cancellationToken) {
            var connectionId = Guid.NewGuid();

            var channel =
                Channel.CreateUnbounded<NotificationEventDto>(
                    new UnboundedChannelOptions { SingleReader = true, SingleWriter = false });

            ConcurrentDictionary<Guid, Channel<NotificationEventDto>> userConnections =
                _connections.GetOrAdd(userId, _ => new ConcurrentDictionary<Guid, Channel<NotificationEventDto>>());
            userConnections[connectionId] = channel;

            cancellationToken.Register(() => {
                if (_connections.TryGetValue(userId,
                        out ConcurrentDictionary<Guid, Channel<NotificationEventDto>>? connections)) {
                    connections.TryRemove(connectionId, out _);

                    if (connections.IsEmpty)
                        _connections.TryRemove(userId, out _);
                }

                channel.Writer.TryComplete();
            });

            return channel.Reader;
        }

        public Task PublishAsync(Guid userId, NotificationEventDto notification, CancellationToken cancellationToken) {
            if (!_connections.TryGetValue(userId,
                    out ConcurrentDictionary<Guid, Channel<NotificationEventDto>>? connections))
                return Task.CompletedTask;

            foreach ((Guid _, Channel<NotificationEventDto> channel) in connections)
                channel.Writer.TryWrite(notification);

            return Task.CompletedTask;
        }
    }
}