using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class CommissionRequest {
        public Guid Id { get; private set; }

        public Guid BidderId { get; private set; }
        public Guid OfferingId { get; private set; }

        public string Brief { get; private set; }
        public CommissionRequestStatus Status { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private CommissionRequest() { }
        #pragma warning restore CS8618
        
        public CommissionRequest(Guid bidderId, Guid offeringId, string brief) {
            Validate(bidderId, offeringId, brief);

            Id = Guid.NewGuid();
            BidderId = bidderId;
            OfferingId = offeringId;
            Brief = brief;
            Status = CommissionRequestStatus.Pending;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }
        
        public static CommissionRequest Load(
            Guid id,
            Guid bidderId,
            Guid offeringId,
            string brief,
            CommissionRequestStatus status,
            DateTime createdAt,
            DateTime updatedAt
        ) {
            Validate(bidderId, offeringId, brief);

            return new CommissionRequest {
                Id = id,
                BidderId = bidderId,
                OfferingId = offeringId,
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

        private static void Validate(Guid bidderId, Guid offeringId, string brief) {
            if (bidderId == Guid.Empty || offeringId == Guid.Empty)
                throw new ArgumentException("Bidder and offering are required.");

            if (string.IsNullOrWhiteSpace(brief))
                throw new ArgumentException("Brief is required.");
        }
    }
}
