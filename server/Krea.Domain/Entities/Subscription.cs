namespace Krea.Domain.Entities {
    public sealed class Subscription {
        public Guid Id { get; private set; }

        public User Subscriber { get; private set; }
        public MembershipPlan Plan { get; private set; }

        public bool IsActive { get; private set; }

        public DateTime CurrentPeriodStart { get; private set; }
        public DateTime CurrentPeriodEnd { get; private set; }

        public DateTime? CanceledAt { get; private set; }
        public DateTime SubscribedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private Subscription() { }
        #pragma warning restore CS8618
        
        public Subscription(
            User subscriber,
            MembershipPlan plan,
            DateTime start,
            DateTime end
        ) {
            Validate(subscriber, plan, start, end);

            Id = Guid.NewGuid();
            Subscriber = subscriber;
            Plan = plan;
            CurrentPeriodStart = start;
            CurrentPeriodEnd = end;
            IsActive = true;
            SubscribedAt = DateTime.UtcNow;
            UpdatedAt = SubscribedAt;
        }
        
        public static Subscription Load(
            Guid id,
            User subscriber,
            MembershipPlan plan,
            bool isActive,
            DateTime start,
            DateTime end,
            DateTime? canceledAt,
            DateTime subscribedAt,
            DateTime updatedAt
        ) {
            Validate(subscriber, plan, start, end);

            return new Subscription {
                Id = id,
                Subscriber = subscriber,
                Plan = plan,
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
            User subscriber,
            MembershipPlan plan,
            DateTime start,
            DateTime end
        ) {
            if (subscriber is null || plan is null)
                throw new ArgumentException("Subscriber and plan are required.");

            ValidatePeriod(start, end);
        }

        private static void ValidatePeriod(DateTime start, DateTime end) {
            if (end <= start)
                throw new ArgumentException("Invalid subscription period.");
        }
    }
}
