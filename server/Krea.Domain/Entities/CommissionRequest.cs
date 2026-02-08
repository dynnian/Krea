using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class CommissionRequest {
        public Guid Id { get; private set; }

        public User Bidder { get; private set; }
        public CommissionOffering Offering { get; private set; }

        public string Brief { get; private set; }
        public CommissionRequestStatus Status { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private CommissionRequest() { }
        #pragma warning restore CS8618

        public CommissionRequest(
            User bidder,
            CommissionOffering offering,
            string brief
        ) {
            Validate(bidder, offering, brief);

            Id = Guid.NewGuid();
            Bidder = bidder;
            Offering = offering;
            Brief = brief;
            Status = CommissionRequestStatus.Pending;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public static CommissionRequest Load(
            Guid id,
            User bidder,
            CommissionOffering offering,
            string brief,
            CommissionRequestStatus status,
            DateTime createdAt,
            DateTime updatedAt
        ) {
            Validate(bidder, offering, brief);

            return new CommissionRequest {
                Id = id,
                Bidder = bidder,
                Offering = offering,
                Brief = brief,
                Status = status,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            };
        }

        public void Accept() => SetStatus(CommissionRequestStatus.Accepted);
        public void Start() => SetStatus(CommissionRequestStatus.InProgress);
        public void Deliver() => SetStatus(CommissionRequestStatus.Delivered);
        public void Cancel() => SetStatus(CommissionRequestStatus.Canceled);

        private void SetStatus(CommissionRequestStatus status) {
            Status = status;
            UpdatedAt = DateTime.UtcNow;
        }

        private static void Validate(
            User bidder,
            CommissionOffering offering,
            string brief
        ) {
            if (bidder is null)
                throw new ArgumentNullException(nameof(bidder));

            if (offering is null)
                throw new ArgumentNullException(nameof(offering));

            if (string.IsNullOrWhiteSpace(brief))
                throw new ArgumentException("Brief is required.");
        }
    }
}
