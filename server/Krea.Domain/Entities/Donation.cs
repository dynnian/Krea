using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Donation {
        public Guid Id { get; private set; }

        public User Donor { get; private set; }
        public User Recipient { get; private set; }

        public Money Amount { get; private set; }
        public string Message { get; private set; }

        public DateTime DonatedAt { get; private set; }

        #pragma warning disable CS8618
        private Donation() { }
        #pragma warning restore CS8618
        
        public Donation(
            User donor,
            User recipient,
            Money amount,
            string? message
        ) {
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
            DateTime donatedAt
        ) {
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

        private static void Validate(User donor, User recipient, decimal amount) {
            if (donor is null || recipient is null)
                throw new ArgumentException("Users are required.");

            if (ReferenceEquals(donor, recipient))
                throw new ArgumentException("Cannot donate to yourself.");

            if (amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.");
        }
    }
}