using System.ComponentModel.DataAnnotations;
using Krea.Domain.Enums;

namespace Krea.Domain.Entities {
    public sealed class Payment {
        public Guid Id { get; private init; }

        [Required]
        public Guid PayerId { get; private set; }

        [Required]
        public Guid PayedToId { get; private set; }

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; private set; }

        public PaymentStatus Status { get; private set; }

        [Required]
        public string ExternalRef { get; private set; }

        public DateTime PayedAt { get; private set; }

#pragma warning disable CS8618
        private Payment() { }
#pragma warning restore CS8618

        public Payment(
            Guid payerId,
            Guid payedToId,
            decimal amount,
            string externalRef
        ) {
            Validate(payerId, payedToId, amount, externalRef);

            Id = Guid.NewGuid();
            PayerId = payerId;
            PayedToId = payedToId;
            Amount = amount;
            ExternalRef = externalRef;
            Status = PaymentStatus.Pending;
            PayedAt = DateTime.UtcNow;
        }

        public static Payment Load(
            Guid id,
            Guid payerId,
            Guid payedToId,
            decimal amount,
            PaymentStatus status,
            string externalRef,
            DateTime payedAt
        ) {
            Validate(payerId, payedToId, amount, externalRef);

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

        private static void Validate(Guid payer, Guid payee, decimal amount, string externalRef) {
            if (payer == Guid.Empty || payee == Guid.Empty)
                throw new ArgumentException("Payer and payee are required.");

            if (amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.");

            if (string.IsNullOrWhiteSpace(externalRef))
                throw new ArgumentException("External reference is required.");
        }
    }
}
