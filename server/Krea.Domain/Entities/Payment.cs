using System.ComponentModel.DataAnnotations;
using Krea.Domain.Enums;

namespace Krea.Domain.Entities {
    public sealed class Payment {
        public Guid Id { get; private init; }

        [Required]
        public Guid PayerId { get; private set; }

        [Required]
        public Guid PayeeId { get; private set; }

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; private set; }

        [Required]
        public PaymentStatus Status { get; private set; }

        /// <summary>
        /// Stripe PaymentIntent ID, PayPal transaction ID, etc.
        /// </summary>
        public string? ExternalReference { get; private set; }

        public DateTime? PaidAt { get; private set; }

#pragma warning disable CS8618
        private Payment() { }
#pragma warning restore CS8618

        /// <summary>
        /// Creates a new payment intent (initially Pending)
        /// </summary>
        public Payment(
            Guid payerId,
            Guid payeeId,
            decimal amount,
            string? externalReference = null
        ) {
            Validate(payerId, payeeId, amount);

            Id = Guid.NewGuid();
            PayerId = payerId;
            PayeeId = payeeId;
            Amount = amount;
            Status = PaymentStatus.Pending;
            ExternalReference = externalReference;
        }

        /// <summary>
        /// Rehydrates a payment from persistence
        /// </summary>
        public static Payment Load(
            Guid id,
            Guid payerId,
            Guid payeeId,
            decimal amount,
            PaymentStatus status,
            string? externalReference,
            DateTime? paidAt
        ) {
            Validate(payerId, payeeId, amount);

            return new Payment {
                Id = id,
                PayerId = payerId,
                PayeeId = payeeId,
                Amount = amount,
                Status = status,
                ExternalReference = externalReference,
                PaidAt = paidAt
            };
        }

        // ---- Domain behavior ----

        public void MarkAsPaid(DateTime paidAtUtc) {
            if (Status != PaymentStatus.Pending)
                throw new InvalidOperationException("Only pending payments can be completed.");

            Status = PaymentStatus.Succeeded;
            PaidAt = paidAtUtc;
        }

        public void Fail() {
            if (Status != PaymentStatus.Pending)
                throw new InvalidOperationException("Only pending payments can fail.");

            Status = PaymentStatus.Failed;
        }

        public void Refund() {
            if (Status != PaymentStatus.Succeeded)
                throw new InvalidOperationException("Only successful payments can be refunded.");

            Status = PaymentStatus.Refunded;
        }

        private static void Validate(Guid payerId, Guid payeeId, decimal amount) {
            if (payerId == Guid.Empty)
                throw new ArgumentException("PayerId is required.");

            if (payeeId == Guid.Empty)
                throw new ArgumentException("PayeeId is required.");

            if (payerId == payeeId)
                throw new ArgumentException("Payer and payee cannot be the same.");

            if (amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.");
        }
    }
}
