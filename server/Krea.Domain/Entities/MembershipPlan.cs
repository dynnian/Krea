using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class MembershipPlan {
        public Guid Id { get; private set; }

        public User Artist { get; private set; }
        public string Name { get; private set; }
        public string Benefits { get; private set; }
        public Media? Image { get; private set; }

        public Money PriceAmount { get; private set; }
        public int MaxSlots { get; private set; }

        public bool IsActive { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private MembershipPlan() { }
        #pragma warning restore CS8618

        public MembershipPlan(
            User artist,
            string name,
            string benefits,
            Money priceAmount,
            int maxSlots,
            Media? image = null
        ) {
            Validate(artist, name, benefits, priceAmount, maxSlots);

            Id = Guid.NewGuid();
            Artist = artist;
            Name = name;
            Benefits = benefits;
            PriceAmount = priceAmount;
            MaxSlots = maxSlots;
            Image = image;
            IsActive = true;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public static MembershipPlan Load(
            Guid id,
            User artist,
            string name,
            string benefits,
            Money priceAmount,
            int maxSlots,
            Media? image,
            bool isActive,
            DateTime createdAt,
            DateTime updatedAt
        ) {
            Validate(artist, name, benefits, priceAmount, maxSlots);

            return new MembershipPlan {
                Id = id,
                Artist = artist,
                Name = name,
                Benefits = benefits,
                PriceAmount = priceAmount,
                MaxSlots = maxSlots,
                Image = image,
                IsActive = isActive,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            };
        }

        public void Deactivate() {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Activate() {
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }

        private static void Validate(
            User artist,
            string name,
            string benefits,
            Money price,
            int maxSlots
        ) {
            if (artist is null)
                throw new ArgumentException("Artist is required.");

            if (string.IsNullOrWhiteSpace(name) || name.Length > 32)
                throw new ArgumentException("Invalid plan name.");

            if (string.IsNullOrWhiteSpace(benefits))
                throw new ArgumentException("Benefits are required.");

            if (price <= Money.Zero(price.Currency))
                throw new ArgumentException("Price must be greater than zero.");

            if (maxSlots <= 0)
                throw new ArgumentException("Max slots must be greater than zero.");
        }
    }
}