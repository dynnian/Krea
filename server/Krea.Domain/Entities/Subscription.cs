namespace Krea.Domain.Entities {
    public sealed class Subscription {
        public Guid Id { get; private init; }

        public Guid SubscriberId { get; private set; }
        public Guid PlanId { get; private set; }

        public bool IsActive { get; private set; }
        public DateTime CurrentPeriodStart { get; private set; }
        public DateTime CurrentPeriodEnd { get; private set; }

        public DateTime? CanceledAt { get; private set; }
        public DateTime SubscribedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        private Subscription() { }

        public Subscription(Guid subscriberId, Guid planId, DateTime start, DateTime end) {
            if (end <= start)
                throw new ArgumentException("Invalid subscription period.");

            Id = Guid.NewGuid();
            SubscriberId = subscriberId;
            PlanId = planId;
            CurrentPeriodStart = start;
            CurrentPeriodEnd = end;
            IsActive = true;
            SubscribedAt = DateTime.UtcNow;
            UpdatedAt = SubscribedAt;
        }

        public void Renew(DateTime newStart, DateTime newEnd) {
            if (!IsActive)
                throw new InvalidOperationException("Cannot renew inactive subscription.");

            CurrentPeriodStart = newStart;
            CurrentPeriodEnd = newEnd;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Cancel() {
            if (!IsActive) return;

            IsActive = false;
            CanceledAt = DateTime.UtcNow;
            UpdatedAt = CanceledAt.Value;
        }
    }
}