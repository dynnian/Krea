using Krea.Domain.ValueObjects;
using System;
using System.Collections.Generic;

namespace Krea.Domain.Entities {
    public sealed class Donation {
        public Guid Id { get; private set; }
        public User Donor { get; private set; }
        public User Recipient { get; private set; }

        private readonly List<Payment> _payments = new();
        public IReadOnlyCollection<Payment> Payments => _payments;

        public Money Amount { get; private set; }
        public string Message { get; private set; }
        public DateTime DonatedAt { get; private set; }

        #pragma warning disable CS8618
        private Donation() { }
        #pragma warning restore CS8618

        public Donation(User donor, User recipient, Money amount, string? message) {
            Validate(donor, recipient, amount);

            Id = Guid.NewGuid();
            Donor = donor;
            Recipient = recipient;
            Amount = amount;
            Message = message ?? string.Empty;
            DonatedAt = DateTime.UtcNow;
        }

        public static Donation Load(
            Guid id,
            User donor,
            User recipient,
            Money amount,
            string message,
            DateTime donatedAt) {
            Validate(donor, recipient, amount);

            return new Donation {
                Id = id,
                Donor = donor,
                Recipient = recipient,
                Amount = amount,
                Message = message,
                DonatedAt = donatedAt
            };
        }

        // Crear un pago asociado a esta donación
        public Payment CreatePayment(User payer, Money amount, ExternalPaymentRef externalRef) {
            if (!ReferenceEquals(payer, Donor))
                throw new ArgumentException("Payer must be the donor.");

            if (amount != Amount)
                throw new ArgumentException("Payment amount must match the donation amount.");

            if (_payments.Count != 0)
                throw new InvalidOperationException("This donation already has a payment.");

            var payment = new Payment(payer, amount, externalRef, this);
            _payments.Add(payment);
            return payment;
        }
        
        public void ConfirmPayment(Guid paymentId)
        {
            Payment? payment = _payments.FirstOrDefault(p => p.Id == paymentId);
            if (payment == null)
                throw new InvalidOperationException("Payment not found in this commission request.");

            payment.MarkCompleted();
        }

        private static void Validate(User donor, User recipient, Money amount) {
            ArgumentNullException.ThrowIfNull(donor);
            ArgumentNullException.ThrowIfNull(recipient);
            if (ReferenceEquals(donor, recipient))
                throw new ArgumentException("Cannot donate to yourself.");
            if (amount <= Money.Zero(amount.Currency))
                throw new ArgumentException("Amount must be greater than zero.");
        }
    }
}