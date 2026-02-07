namespace Krea.Domain.Entities {
    public sealed class MembershipPlan {
        public Guid Id { get; private set; }

        public Guid ArtistId { get; private set; }
        public string Name { get; private set; }
        public string Benefits { get; private set; }
        public Guid? ImageId { get; private set; }

        public decimal PriceAmount { get; private set; }
        public int MaxSlots { get; private set; }

        public bool IsActive { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private MembershipPlan() { }
        #pragma warning restore CS8618
        
        public MembershipPlan(
            Guid artistId,
            string name,
            string benefits,
            decimal priceAmount,
            int maxSlots,
            Guid? imageId = null
        ) {
            Validate(artistId, name, benefits, priceAmount, maxSlots);

            Id = Guid.NewGuid();
            ArtistId = artistId;
            Name = name;
            Benefits = benefits;
            PriceAmount = priceAmount;
            MaxSlots = maxSlots;
            ImageId = imageId;
            IsActive = true;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }
        
        public static MembershipPlan Load(
            Guid id,
            Guid artistId,
            string name,
            string benefits,
            decimal priceAmount,
            int maxSlots,
            Guid? imageId,
            bool isActive,
            DateTime createdAt,
            DateTime updatedAt
        ) {
            Validate(artistId, name, benefits, priceAmount, maxSlots);

            return new MembershipPlan {
                Id = id,
                ArtistId = artistId,
                Name = name,
                Benefits = benefits,
                PriceAmount = priceAmount,
                MaxSlots = maxSlots,
                ImageId = imageId,
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
            Guid artistId,
            string name,
            string benefits,
            decimal price,
            int maxSlots
        ) {
            if (artistId == Guid.Empty)
                throw new ArgumentException("Artist is required.");

            if (string.IsNullOrWhiteSpace(name) || name.Length > 32)
                throw new ArgumentException("Invalid plan name.");

            if (string.IsNullOrWhiteSpace(benefits))
                throw new ArgumentException("Benefits are required.");

            if (price <= 0)
                throw new ArgumentException("Price must be greater than zero.");

            if (maxSlots <= 0)
                throw new ArgumentException("Max slots must be greater than zero.");
        }
    }
}
