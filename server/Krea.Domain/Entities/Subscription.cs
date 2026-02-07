namespace Krea.Domain.Entities {
    public sealed class Subscription {
        public Guid Id { get; private set; }

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

        // Constructor de negocio
        public Subscription(
            Guid subscriberId,
            Guid planId,
            DateTime start,
            DateTime end
        ) {
            Validate(subscriberId, planId, start, end);

            Id = Guid.NewGuid();
            SubscriberId = subscriberId;
            PlanId = planId;
            CurrentPeriodStart = start;
            CurrentPeriodEnd = end;
            IsActive = true;
            SubscribedAt = DateTime.UtcNow;
            UpdatedAt = SubscribedAt;
        }

        // Load desde persistencia
        public static Subscription Load(
            Guid id,
            Guid subscriberId,
            Guid planId,
            bool isActive,
            DateTime start,
            DateTime end,
            DateTime? canceledAt,
            DateTime subscribedAt,
            DateTime updatedAt
        ) {
            Validate(subscriberId, planId, start, end);

            return new Subscription {
                Id = id,
                SubscriberId = subscriberId,
                PlanId = planId,
                IsActive = isActive,
                CurrentPeriodStart = start,
                CurrentPeriodEnd = end,
                CanceledAt = canceledAt,
                SubscribedAt = subscribedAt,
                UpdatedAt = updatedAt
            };
        }

        public void Renew(DateTime newStart, DateTime newEnd) {
            if (!IsActive)
                throw new InvalidOperationException("Cannot renew inactive subscription.");

            ValidatePeriod(newStart, newEnd);
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

        private static void Validate(
            Guid subscriberId,
            Guid planId,
            DateTime start,
            DateTime end
        ) {
            if (subscriberId == Guid.Empty || planId == Guid.Empty)
                throw new ArgumentException("Subscriber and plan are required.");

            ValidatePeriod(start, end);
        }

        private static void ValidatePeriod(DateTime start, DateTime end) {
            if (end <= start)
                throw new ArgumentException("Invalid subscription period.");
        }
    }
}
