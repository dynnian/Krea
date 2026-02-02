using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities
{
    public sealed class Post {
        public Guid Id { get; private set; }
        public User PostOp { get; private set; }
        
        [StringLength(64), Required(ErrorMessage = "Title is required")]
        public string Title { get; private set; }
        public string? Content { get; private set; }
        public IReadOnlyList<Media> MediaContent => _mediaContent.AsReadOnly();
        private List<Media> _mediaContent;
        public IReadOnlyList<Like> Likes => _likes.AsReadOnly();
        private List<Like> _likes;
        public bool IsWwork {get; private set;}
        public bool isDeleted {get; private set;}
        public bool IsLocal {get; private set;}
        public Post? RepliedTo { get; private set; }
        public Post? RepostOf { get; private set; }
        public DateTime DeletedAt { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }        
    }
}