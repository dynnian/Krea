using Krea.Domain.Enums;
using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Payment {
        public Guid Id { get; private init; }

        public Guid PayerId { get; private set; }
        public Guid PayedToId { get; private set; }

        public Money Amount { get; private set; }
        public PaymentStatus Status { get; private set; }

        public ExternalPaymentRef ExternalRef { get; private set; }
        public DateTime PayedAt { get; private set; }

        private Payment() { }

        public Payment(
            Guid payerId,
            Guid payedToId,
            Money amount,
            ExternalPaymentRef externalRef
        ) {
            if (payerId == payedToId)
                throw new ArgumentException("Payer and payee cannot be the same.");

            Id = Guid.NewGuid();
            PayerId = payerId;
            PayedToId = payedToId;
            Amount = amount;
            ExternalRef = externalRef;
            Status = PaymentStatus.Pending;
            PayedAt = DateTime.UtcNow;
        }

        public void MarkCompleted() {
            if (Status != PaymentStatus.Pending)
                throw new InvalidOperationException("Only pending payments can be completed.");

            Status = PaymentStatus.Completed;
        }

        public void MarkFailed() {
            if (Status != PaymentStatus.Pending)
                throw new InvalidOperationException("Only pending payments can fail.");

            Status = PaymentStatus.Failed;
        }
    }
}