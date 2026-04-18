using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    using ValueObjects;

    public sealed class Collection {
        [Key] public Guid Id { get; private set; }

        public string Title { get; private set; }

        public Media? Image { get; private set; }
        public Guid? MediaId { get; private set; }

        public string? Description { get; private set; }

        public int ItemCount { get; private set; }
        
        public CollectionType  Type { get; private set; }

        public User Owner { get; private set; }
        public Guid OwnerId { get; private set; }

        private readonly List<Post> _posts = new();
        public IReadOnlyCollection<Post> Posts => _posts.AsReadOnly();

        public DateTime CreatedAt { get; private set; }

        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private Collection() { }
        #pragma warning restore CS8618

        public Collection(
            Guid ownerId,
            string title,
            string? description,
            CollectionType type
        ) {
            Id = Guid.NewGuid();
            OwnerId = ownerId;
            Title = title;
            Description = description ?? string.Empty;
            ItemCount = 0;
            Type = type;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public static Collection Load(
            Guid id,
            Guid ownerId,
            string title,
            string? description,
            CollectionType type,
            Guid? mediaId,
            DateTime createdAt,
            DateTime updatedAt
        ) {
            var collection = new Collection(
                ownerId,
                title,
                description,
                type);

            collection.Id = id;
            collection.MediaId = mediaId;
            collection.CreatedAt = createdAt;
            collection.UpdatedAt = updatedAt;

            return collection;
        }

        public void AddPost(Post post) {
            if (_posts.Any(p => p.Id == post.Id))
                return;

            _posts.Add(post);
            ItemCount = _posts.Count;
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemovePost(Guid postId)
        {
            Post? post = _posts.FirstOrDefault(p => p.Id == postId);

            if (post is null)
                throw new InvalidOperationException("Post is not part of this collection.");

            _posts.Remove(post);
            ItemCount = _posts.Count;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateInfo(string title, string description) {
            Title = title;
            Description = description;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateImage(Media image) {
            Image = image;
            MediaId = image.Id;
            UpdatedAt = DateTime.UtcNow;
        }
        
        public void UpdateTitle(string title)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required.", nameof(title));

            Title = title;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}