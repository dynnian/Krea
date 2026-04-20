namespace Krea.Application.Features.Notifications.Dto {
    public sealed class NotificationEventDto {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public Guid? ActorUserId { get; init; }
        public int Type { get; init; }
        public Guid? EntityId { get; init; }
        public int? EntityType { get; init; }
        public string Content { get; init; } = string.Empty;
        public bool IsRead { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}