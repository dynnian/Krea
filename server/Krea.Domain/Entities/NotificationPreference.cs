namespace Krea.Domain.Entities {
    using ValueObjects;

    public sealed class NotificationPreference {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public NotificationType Type { get; private set; }

        public bool InAppEnabled { get; private set; }
        public bool EmailEnabled { get; private set; }

        public bool IsPaused { get; private set; } // pausa este tipo en específico
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public User User { get; private set; } = default!;

#pragma warning disable CS8618
        private NotificationPreference() { }
#pragma warning restore CS8618

        public NotificationPreference(
            Guid userId,
            NotificationType type,
            bool inAppEnabled = true,
            bool emailEnabled = false,
            bool isPaused = false) {
            Id = Guid.NewGuid();
            UserId = userId;
            Type = type;
            InAppEnabled = inAppEnabled;
            EmailEnabled = emailEnabled;
            IsPaused = isPaused;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Update(bool inAppEnabled, bool emailEnabled, bool isPaused) {
            InAppEnabled = inAppEnabled;
            EmailEnabled = emailEnabled;
            IsPaused = isPaused;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}