using System.ComponentModel.DataAnnotations;
using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Like {
        [Key] public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public User User { get; private set; } = null!;
        public Guid PostId { get; private set; }
        public Post Post { get; private set; } = null!;
        public DateTime CreatedAt { get; private set; }

        #pragma warning disable CS8618
        private Like() { }
        #pragma warning restore CS8618

        public Like(Guid postId, Guid userId) {
            Id = Guid.NewGuid();
            PostId = postId;
            UserId = userId;
            CreatedAt = DateTime.UtcNow;
        }

        public Like Load(
            Guid id,
            User user,
            DateTime createdAt) =>
            new() { Id = id, User = user, CreatedAt = createdAt };
    }
}