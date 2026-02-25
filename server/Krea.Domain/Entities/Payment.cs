using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Payment {
        public Guid Id { get; private set; }
        public User Payer { get; private set; }

        public Subscription? Subscription { get; private set; }
        public Donation? Donation { get; private set; }
        public CommissionRequest? CommissionRequest { get; private set; }

        public Money Amount { get; private set; }
        public PaymentStatus Status { get; private set; }
        public ExternalPaymentRef ExternalRef { get; private set; }
        public DateTime? PaidAt { get; private set; }

        #pragma warning disable CS8618
        private Payment() { }
        #pragma warning restore CS8618

        private Payment(
            User payer,
            Money amount,
            ExternalPaymentRef externalRef,
            Subscription? subscription,
            Donation? donation,
            CommissionRequest? commissionRequest) {
            ValidateTarget(subscription, donation, commissionRequest);

            Id = Guid.NewGuid();
            Payer = payer ?? throw new ArgumentNullException(nameof(payer));
            Amount = amount;
            ExternalRef = externalRef ?? throw new ArgumentNullException(nameof(externalRef));

            Subscription = subscription;
            Donation = donation;
            CommissionRequest = commissionRequest;

            Status = PaymentStatus.Pending;
            PaidAt = null;
        }

        // Constructores usados por las raices
        internal Payment(User payer, Money amount, ExternalPaymentRef externalRef, Subscription subscription)
            : this(payer, amount, externalRef, subscription, null, null) { }

        internal Payment(User payer, Money amount, ExternalPaymentRef externalRef, Donation donation)
            : this(payer, amount, externalRef, null, donation, null) { }

        internal Payment(User payer, Money amount, ExternalPaymentRef externalRef, CommissionRequest commission)
            : this(payer, amount, externalRef, null, null, commission) { }

        public void MarkCompleted() {
            if (Status != PaymentStatus.Pending)
                throw new InvalidOperationException("Only pending payments can be completed.");

            Status = PaymentStatus.Completed;
            PaidAt = DateTime.UtcNow;
        }

        public void MarkFailed() {
            if (Status != PaymentStatus.Pending)
                throw new InvalidOperationException("Only pending payments can fail.");

            Status = PaymentStatus.Failed;
        }

        // Indica el tipo de pago
        public PaymentType Type {
            get {
                if (Subscription != null) return PaymentType.Subscription;
                if (Donation != null) return PaymentType.Donation;
                if (CommissionRequest != null) return PaymentType.Commission;
                throw new InvalidOperationException("Payment is not associated with any entity.");
            }
        }

        private static void ValidateTarget(Subscription? s, Donation? d, CommissionRequest? c) {
            int count = (s != null ? 1 : 0) + (d != null ? 1 : 0) + (c != null ? 1 : 0);
            if (count != 1)
                throw new ArgumentException(
                    "A payment must be associated with exactly one of: Subscription, CommissionRequest, or Donation.");
        }
    }
}