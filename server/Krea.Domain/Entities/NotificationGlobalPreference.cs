namespace Krea.Domain.Entities {
    public sealed class NotificationGlobalPreference {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }

        public bool AllNotificationsPaused { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public User User { get; private set; } = default!;

        #pragma warning disable CS8618 
        private NotificationGlobalPreference() { }
        #pragma warning restore CS8618
        
        public NotificationGlobalPreference(Guid userId, bool allNotificationsPaused = false)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            AllNotificationsPaused = allNotificationsPaused;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetPaused(bool paused)
        {
            AllNotificationsPaused = paused;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}