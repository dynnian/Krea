namespace Krea.Domain.Entities {
    using System.ComponentModel.DataAnnotations;

    public sealed class PostFavorite {
        [Key] public Guid Id { get; private set; }

        public Guid UserId { get; private set; }
        public User User { get; private set; } = null!;

        public Guid PostId { get; private set; }
        public Post Post { get; private set; } = null!;

        public DateTime CreatedAt { get; private set; }

        #pragma warning disable CS8618
        private PostFavorite() { }
        #pragma warning restore CS8618

        public PostFavorite(Guid userId, Guid postId) {
            Id = Guid.NewGuid();
            UserId = userId;
            PostId = postId;
            CreatedAt = DateTime.UtcNow;
        }
    }
}