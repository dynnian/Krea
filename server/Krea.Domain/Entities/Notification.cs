namespace Krea.Domain.Entities {
    using ValueObjects;

    public sealed class Notification {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }       // destinatario
        public Guid? ActorUserId { get; private set; } // quien causo la accion

        public NotificationType Type { get; private set; }

        public Guid? EntityId { get; private set; } // post, user, etc.
        public NotificationEntityType? EntityType { get; private set; }

        public string Content { get; private set; } = default!;

        public bool IsRead { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? ReadAt { get; private set; }

        public User User { get; private set; } = default!;
        public User? ActorUser { get; private set; }

        #pragma warning disable CS8618
        private Notification() { }
        #pragma warning restore CS8618

        public Notification(
            Guid userId,
            Guid? actorUserId,
            NotificationType type,
            string content,
            Guid? entityId = null,
            NotificationEntityType? entityType = null) {
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Notification content cannot be empty.", nameof(content));

            Id = Guid.NewGuid();
            UserId = userId;
            ActorUserId = actorUserId;
            Type = type;
            Content = content;
            EntityId = entityId;
            EntityType = entityType;
            CreatedAt = DateTime.UtcNow;
            IsRead = false;
        }

        public void MarkAsRead() {
            if (IsRead)
                return;

            IsRead = true;
            ReadAt = DateTime.UtcNow;
        }
    }
}