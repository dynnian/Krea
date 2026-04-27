using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class CommissionOffering {
        public Guid Id { get; private init; }

        public User Artist { get; private set; }

        public string Title { get; private set; }
        public string? Description { get; private set; }

        public Money BasePrice { get; private set; }
        public int MaxSlots { get; private set; }

        public bool IsActive { get; private set; }

        public DateTime CreatedAt { get; private set; }

        #pragma warning disable CS8618
        private CommissionOffering() { }
        #pragma warning restore CS8618

        public CommissionOffering(
            User artist,
            string title,
            Money basePrice,
            int maxSlots,
            string? description = null
        ) {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required.");

            if (maxSlots <= 0)
                throw new ArgumentException("Max slots must be greater than zero.");

            Id = Guid.NewGuid();
            Artist = artist ?? throw new ArgumentNullException(nameof(artist));
            Title = title;
            Description = description;
            BasePrice = basePrice;
            MaxSlots = maxSlots;
            IsActive = true;
            CreatedAt = DateTime.UtcNow;
        }

        public static CommissionOffering Load(
            Guid id,
            User artist,
            string title,
            Money basePrice,
            int maxSlots,
            bool isActive,
            DateTime createdAt,
            string? description = null
        ) {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required.");

            if (maxSlots <= 0)
                throw new ArgumentException("Max slots must be greater than zero.");

            return new CommissionOffering {
                Id = id,
                Artist = artist ?? throw new ArgumentNullException(nameof(artist)),
                Title = title,
                Description = description,
                BasePrice = basePrice,
                MaxSlots = maxSlots,
                IsActive = isActive,
                CreatedAt = createdAt
            };
        }

        public void Deactivate() => IsActive = false;

        public void Activate() => IsActive = true;

        public void Update(string title, string? description, Money basePrice, int maxSlots) {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required.");
            if (maxSlots <= 0)
                throw new ArgumentException("Max slots must be greater than zero.");

            Title = title;
            Description = description;
            BasePrice = basePrice;
            MaxSlots = maxSlots;
        }
    }
}