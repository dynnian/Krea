using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class CommissionRequest {
        public Guid Id { get; private init; }

        public Guid BidderId { get; private set; }
        public Guid OfferingId { get; private set; }

        public string Brief { get; private set; }
        public CommissionRequestStatus Status { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        private CommissionRequest() { }

        public CommissionRequest(Guid bidderId, Guid offeringId, string brief) {
            if (string.IsNullOrWhiteSpace(brief))
                throw new ArgumentException("Brief is required.");

            Id = Guid.NewGuid();
            BidderId = bidderId;
            OfferingId = offeringId;
            Brief = brief;
            Status = CommissionRequestStatus.Pending;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void Accept() => SetStatus(CommissionRequestStatus.Accepted);
        public void Start() => SetStatus(CommissionRequestStatus.InProgress);
        public void Deliver() => SetStatus(CommissionRequestStatus.Delivered);
        public void Cancel() => SetStatus(CommissionRequestStatus.Canceled);

        private void SetStatus(CommissionRequestStatus status) {
            Status = status;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}