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

#pragma warning disable CS8618
        private Subscription() { }
#pragma warning restore CS8618

        public Subscription(Guid subscriberId, Guid planId, DateTime start, DateTime end) {
            Id = Guid.NewGuid();
            SubscriberId = subscriberId;
            PlanId = planId;
            CurrentPeriodStart = start;
            CurrentPeriodEnd = end;
            IsActive = true;
            SubscribedAt = DateTime.UtcNow;
            UpdatedAt = SubscribedAt;
        }

        public void Cancel() {
            IsActive = false;
            CanceledAt = DateTime.UtcNow;
            UpdatedAt = CanceledAt.Value;
        }
    }
}