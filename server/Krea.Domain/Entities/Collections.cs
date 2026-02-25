using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Collections {
        public Guid Id { get; private set; }
        
        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; private set; }
        
        public Media? Image { get; private set; }
        
        public string Description { get; private set; }
        
        [Required(ErrorMessage = "ItemCount is required.")]
        public int ItemCount { get; private set; }
        
        [Timestamp] public DateTime CreatedAt { get; private set; }
        
        [Timestamp] public DateTime UpdatedAt { get; private set; } 
        
        #pragma warning disable CS8618
        private Collections() { }
        #pragma warning restore CS8618

        public Collections(
            string title,
            string? description,
            int itemCount
        )
        {
            if (string.IsNullOrWhiteSpace(title) || int.IsNegative(itemCount))
                throw new ArgumentException("Required arguments are missing");
            
            Id = Guid.NewGuid();
            Title = title;
            Description = description ?? string.Empty;
            ItemCount = 0;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public Collections Load(
            Guid id,
            string title,
            string description,
            Media? image,
            int itemCount,
            DateTime createdAt,
            DateTime updatedAt
            )
        {
            if (string.IsNullOrWhiteSpace(title) || int.IsNegative(itemCount))
                throw new ArgumentException("Required arguments are missing");
            
            var collections = new Collections { 
                Id = id, 
                Title = title, 
                Description = description, 
                Image = image, 
                ItemCount = itemCount, 
                CreatedAt = createdAt, 
                UpdatedAt = updatedAt 
            };
            return collections;
        }
        
        public void AddItem() {
            ItemCount++;
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemoveItem() {
            if (ItemCount > 0)
                ItemCount--;
            UpdatedAt = DateTime.UtcNow;
        }
        
        public void UpdateInfo(string title, string description) {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required");

            Title = title;
            Description = description;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateImage(Media image) {
            Image = image;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}