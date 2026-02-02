using Krea.Domain.Enums;

namespace Krea.Domain.Entities {
    public sealed class CommissionRequest {
        public Guid Id { get; private init; }

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
            Id = Guid.NewGuid();
            BidderId = bidderId;
            OfferingId = offeringId;
            Brief = brief;
            Status = CommissionRequestStatus.Pending;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void UpdateStatus(CommissionRequestStatus status) {
            Status = status;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}