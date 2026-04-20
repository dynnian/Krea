namespace Krea.Application.Features.Notifications.Dto {
    using Domain.Entities;
    using Domain.ValueObjects;

    public sealed class NotificationDto {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public Guid? ActorUserId { get; init; }
        public string Content { get; init; } = string.Empty;
        public NotificationType Type { get; init; }
        public Guid? EntityId { get; init; }
        public NotificationEntityType? EntityType { get; init; }
        public bool IsRead { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime? ReadAt { get; init; }

        public static NotificationDto FromDomain(Notification notification) => new()
        {
            Id = notification.Id,
            UserId = notification.UserId,
            ActorUserId = notification.ActorUserId,
            Content = notification.Content,
            Type = notification.Type,
            EntityId = notification.EntityId,
            EntityType = notification.EntityType,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ReadAt = notification.ReadAt
        };
    }
}