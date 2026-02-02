using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class MembershipPlan {
        public Guid Id { get; private init; }

        public Guid ArtistId { get; private set; }

        [Required, MaxLength(32)]
        public string Name { get; private set; }

        [Required]
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
    }
}