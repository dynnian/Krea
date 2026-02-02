using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Donation {

        public Guid Id { get; private init; }

        [Required]
        public Guid FromUserId { get; private set; }

        [Required]
        public Guid ToArtistId { get; private set; }

        public decimal Amount { get; private set; }

        [Required]
        public string Message { get; private set; }

        public DateTime DonatedAt { get; private set; }

#pragma warning disable CS8618
        private Donation() { }
#pragma warning restore CS8618

        public Donation(
            Guid fromUserId,
            Guid toArtistId,
            decimal amount,
            string message
        ) {
            if (string.IsNullOrWhiteSpace(message))
                throw new ArgumentException("Message is required.");

            Id = Guid.NewGuid();
            FromUserId = fromUserId;
            ToArtistId = toArtistId;
            Amount = amount;
            Message = message;
            DonatedAt = DateTime.UtcNow;
        }        

        public static Donation Load(
            Guid id,
            Guid fromUserId,
            Guid toArtistId,
            decimal amount,
            string? message,
            DateTime donatedAt
        ) {
            Validate(fromUserId, toArtistId, amount);

            return new Donation {
                Id = id,
                FromUserId = fromUserId,
                ToArtistId = toArtistId,
                Amount = amount,
                Message = message,
                DonatedAt = donatedAt
            };
        }

        private static void Validate(Guid from, Guid to, decimal amount) {
            if (from == Guid.Empty || to == Guid.Empty)
                throw new ArgumentException("Users are required.");

            if (from == to)
                throw new ArgumentException("Cannot donate to yourself.");

            if (amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.");
        }
    }
}
