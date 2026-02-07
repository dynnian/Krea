using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Payment {
        public Guid Id { get; private set; }

        public Guid PayerId { get; private set; }
        public Guid PayedToId { get; private set; }

        public Money Amount { get; private set; }
        public PaymentStatus Status { get; private set; }

        public ExternalPaymentRef ExternalRef { get; private set; }
        public DateTime? PayedAt { get; private set; }

        #pragma warning disable CS8618
        private Payment() { }
        #pragma warning restore CS8618
        
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
            PayedAt = null;
        }
        
        public static Payment Load(
            Guid id,
            Guid payerId,
            Guid payedToId,
            Money amount,
            PaymentStatus status,
            ExternalPaymentRef externalRef,
            DateTime? payedAt
        ) {
            if (payerId == payedToId)
                throw new ArgumentException("Payer and payee cannot be the same.");

            return new Payment {
                Id = id,
                PayerId = payerId,
                PayedToId = payedToId,
                Amount = amount,
                Status = status,
                ExternalRef = externalRef,
                PayedAt = payedAt
            };
        }

        public void MarkCompleted() {
            if (Status != PaymentStatus.Pending)
                throw new InvalidOperationException("Only pending payments can be completed.");

            Status = PaymentStatus.Completed;
            PayedAt = DateTime.UtcNow;
        }

        public void MarkFailed() {
            if (Status != PaymentStatus.Pending)
                throw new InvalidOperationException("Only pending payments can fail.");

            Status = PaymentStatus.Failed;
        }
    }
}
