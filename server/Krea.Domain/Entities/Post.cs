using System.ComponentModel.DataAnnotations;
using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities
{
    public sealed class Post {
        public Guid Id { get; private set; }
        
        public Guid AuthorPost { get; private set; }
        
        public PostType Type { get; private set; }
        
        [StringLength(64), Required(ErrorMessage = "Title is required")]
        public string Title { get; private set; }
        
        public string? Content { get; private set; }
        
        public IReadOnlyList<Media> MediaContent => _mediaContent.AsReadOnly();
        
        private List<Media> _mediaContent;
        
        public IReadOnlyList<Like> Likes => _likes.AsReadOnly();
        
        private List<Like> _likes;
        
        public bool IsWork {get; private set;}
        
        public bool IsDeleted {get; private set;}
        
        public bool IsLocal {get; private set;}
        
        public Guid? RepliedTo { get; private set; }
        
        public Guid? RepostOf { get; private set; }
        
        [Timestamp] public DateTime? DeletedAt { get; private set; }
        
        [Timestamp] public DateTime UploadedAt { get; private set; }
        
        [Timestamp] public DateTime UpdatedAt { get; private set; }
        
        private readonly List<PostUpload> _uploads = new();
        
        public IReadOnlyCollection<PostUpload> Uploads => _uploads.AsReadOnly();
        
        #pragma warning disable CS8618
        private Post() { }
        #pragma warning restore CS8618

        public Post(
            Guid authorPost,
            PostType type,
            string title,
            string content,
            bool isWork,
            bool isLocal
        ) {
            Validate(authorPost, title);

            Id = Guid.NewGuid();
            AuthorPost = authorPost;
            Type = type;
            Title = title;
            Content = content ?? string.Empty;
            IsWork = isWork;
            IsLocal = isLocal;
            IsDeleted = false;
            UploadedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            DeletedAt = null;
        }
        
        public Post Load(
            Guid id,
            Guid authorPost,
            PostType type,
            string title,
            string content,
            bool isWork,
            bool isDeleted,
            bool isLocal,
            Guid? repliedTo,
            Guid? repostOf,
            DateTime uploadedAt,
            DateTime updatedAt,
            DateTime? deletedAt
        ) {
            Validate(authorPost, title);

            var post = new Post {
                Id = id,
                AuthorPost = authorPost,
                Type = type,
                Title = title,
                Content = content,
                IsWork = isWork,
                IsDeleted = isDeleted,
                IsLocal = isLocal,
                RepliedTo = repliedTo,
                RepostOf = repostOf,
                UploadedAt = uploadedAt,
                UpdatedAt = updatedAt,
                DeletedAt = deletedAt
            };
            return post;
        }
        
        public void UpdateContent(string content) {
            if (IsDeleted)
                throw new InvalidOperationException("Cannot update deleted post");

            Content = content ?? string.Empty;
            UpdatedAt = DateTime.UtcNow;
        }
        
        public void MarkAsWork() {
            IsWork = true;
            UpdatedAt = DateTime.UtcNow;
        }
        
        public void AddMedia(Media media) {
            if (IsDeleted)
                throw new InvalidOperationException("Cannot modify a deleted post");

            _mediaContent.Add(media);
            UpdatedAt = DateTime.UtcNow;
        }

        public void ReplyTo(Guid postId) {
            RepliedTo = postId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Repost(Guid postId) {
            RepostOf = postId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Delete() {
            if (IsDeleted) return;

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        
        //Uploading work content actions
        public void AddUpload(Guid uploadId, Guid mediaId, bool isWorkMedia) {
            if (IsDeleted)
                throw new InvalidOperationException("Cannot modify deleted post");

            if (_uploads.Any(u => u.MediaId == mediaId))
                throw new InvalidOperationException("Media already attached to post");

            if (isWorkMedia && _uploads.Any(u => u.IsWorkMedia))
                throw new InvalidOperationException("Only one work media allowed");

            _uploads.Add(new PostUpload(uploadId, mediaId, isWorkMedia));
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemoveUpload(Guid mediaId) {
            var upload = _uploads.FirstOrDefault(u => u.MediaId == mediaId);
            if (upload == null) return;

            _uploads.Remove(upload);
            UpdatedAt = DateTime.UtcNow;
        }

        private static void Validate(Guid authorPost, string title)
        {
            if (authorPost == Guid.Empty
                || string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("All arguments are required");
        }
    }
}