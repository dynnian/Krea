using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Collections {
        [Key]
        public Guid Id { get; private set; }
        
        public string Title { get; private set; }
        
        public Media? Image { get; private set; }
        public Guid MediaId { get; private set; }
        
        public string Description { get; private set; }
        
        public int ItemCount { get; private set; }
        
        public User Owner { get; private set; }
        public Guid OwnerId { get; private set; }
        
        private readonly List<Post> _posts = new();
        public IReadOnlyCollection<Post> Posts => _posts.AsReadOnly();
        
        public DateTime CreatedAt { get; private set; }
        
        public DateTime UpdatedAt { get; private set; } 
        
        #pragma warning disable CS8618
        private Collections() { }
        #pragma warning restore CS8618

        public Collections(
            Guid ownerId,
            string title,
            string? description,
            int itemCount
        )
        {
            Id = Guid.NewGuid();
            OwnerId = ownerId;
            Title = title;
            Description = description ?? string.Empty;
            ItemCount = itemCount;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public Collections Load(
            Guid id,
            string title,
            string description,
            Media? image,
            Guid mediaId,
            User owner,
            Guid ownerId,
            int itemCount,
            DateTime createdAt,
            DateTime updatedAt
            )
        {
            var collections = new Collections { 
                Id = id, 
                Title = title, 
                Description = description, 
                Image = image, 
                MediaId = mediaId,
                Owner =  owner,
                OwnerId =  ownerId,
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