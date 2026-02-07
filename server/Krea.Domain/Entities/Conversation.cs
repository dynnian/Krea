namespace Krea.Domain.Entities {
    public sealed class Conversation {
        public Guid Id { get; private set; }

        public string Title { get; private set; }
        public string Description { get; private set; }
        public Guid? IconId { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

#pragma warning disable CS8618
        private Conversation() { }
#pragma warning restore CS8618
        
        public Conversation(string title, string description, Guid? iconId = null) {
            Validate(title, description);

            Id = Guid.NewGuid();
            Title = title;
            Description = description;
            IconId = iconId;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }
        
        public static Conversation Load(
            Guid id,
            string title,
            string description,
            Guid? iconId,
            DateTime createdAt,
            DateTime updatedAt
        ) {
            Validate(title, description);

            return new Conversation {
                Id = id,
                Title = title,
                Description = description,
                IconId = iconId,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            };
        }

        public void UpdateDetails(string title, string description, Guid? iconId) {
            Validate(title, description);

            Title = title;
            Description = description;
            IconId = iconId;
            UpdatedAt = DateTime.UtcNow;
        }

        private static void Validate(string title, string description) {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required.");
            if (title.Length > 32)
                throw new ArgumentException("Title cannot exceed 32 characters.");

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("Description is required.");
            if (description.Length > 256)
                throw new ArgumentException("Description cannot exceed 256 characters.");
        }
    }
}
