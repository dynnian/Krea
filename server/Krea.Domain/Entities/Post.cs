using System.ComponentModel.DataAnnotations;
using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Post {
        [Key] public Guid Id { get; private set; }

        public Guid AuthorPostId { get; private set; }
        public User AuthorPost { get; private set; } = null!;

        public PostType Type { get; private set; }

        public string Title { get; private set; }

        public string? Content { get; private set; }

        public bool IsWork { get; private set; }

        public bool IsDeleted { get; private set; }

        public bool IsLocal { get; private set; }

        public Guid? RepliedToId { get; private set; }

        public Post? RepliedTo { get; private set; }

        public Guid? RepostOfId { get; private set; }
        public Post? RepostOf { get; private set; }

        public DateTime? DeletedAt { get; private set; }

        public DateTime UploadedAt { get; private set; }

        public DateTime UpdatedAt { get; private set; }

        private readonly List<PostUpload> _uploads = new();
        public IReadOnlyCollection<PostUpload> Uploads => _uploads.AsReadOnly();

        private readonly List<Hashtag> _hashtags = new();
        public IReadOnlyCollection<Hashtag> Hashtags => _hashtags.AsReadOnly();

        private readonly List<Like> _likes = new();
        public IReadOnlyCollection<Like> Likes => _likes.AsReadOnly();

        private readonly List<Collection> _collections = new();
        public IReadOnlyCollection<Collection> Collections => _collections.AsReadOnly();

        public ICollection<PostFavorite> Favorites { get; set; } = new List<PostFavorite>();

        #pragma warning disable CS8618
        private Post() { }
        #pragma warning restore CS8618

        public Post(
            Guid authorPostId,
            PostType type,
            string title,
            string content,
            bool isWork,
            bool isLocal
        ) {
            Validate(title);

            Id = Guid.NewGuid();
            AuthorPostId = authorPostId;
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

        public static Post Load(
            Guid id,
            Guid authorPostId,
            PostType type,
            string title,
            string content,
            bool isWork,
            bool isDeleted,
            bool isLocal,
            Guid? repliedToId,
            Guid? repostOfId,
            DateTime uploadedAt,
            DateTime updatedAt,
            DateTime? deletedAt
        ) {
            var post = new Post(
                authorPostId,
                type,
                title,
                content,
                isWork,
                isLocal
            );

            post.Id = id;
            post.IsDeleted = isDeleted;
            post.RepliedToId = repliedToId;
            post.RepostOfId = repostOfId;
            post.UploadedAt = uploadedAt;
            post.UpdatedAt = updatedAt;
            post.DeletedAt = deletedAt;

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

        public void ReplyTo(Guid postId) {
            RepliedToId = postId;
            UpdatedAt = DateTime.UtcNow;
        }


        public void Repost(Guid postId) {
            if (IsDeleted)
                throw new InvalidOperationException("Cannot repost a deleted post");

            if (RepostOfId.HasValue)
                throw new InvalidOperationException("Post is already a repost");

            if (postId == Id)
                throw new InvalidOperationException("A post cannot repost itself");

            RepostOfId = postId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Delete() {
            if (IsDeleted) return;

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        //Uploading work content actions
        public PostUpload AddUpload(Media media, bool isWorkMedia) {
            if (IsDeleted)
                throw new InvalidOperationException("Cannot modify deleted post");

            if (Type == PostType.Plain)
                throw new InvalidOperationException("Standard posts cannot have uploads");

            if (_uploads.Any(u => u.MediaId == media.Id))
                throw new InvalidOperationException("Media already attached");

            if (Type == PostType.Image && _uploads.Count >= 1)
                throw new InvalidOperationException("Image posts allow only one upload");

            if (isWorkMedia && _uploads.Any(u => u.IsWorkMedia))
                throw new InvalidOperationException("Only one work media allowed");

            var upload = new PostUpload(Id, media.Id, isWorkMedia);

            _uploads.Add(upload);
            UpdatedAt = DateTime.UtcNow;

            return upload;
        }

        public void RemoveUpload(Guid mediaId) {
            PostUpload? upload = _uploads.FirstOrDefault(u => u.MediaId == mediaId);
            if (upload is null)
                return;

            _uploads.Remove(upload);
            UpdatedAt = DateTime.UtcNow;
        }

        public void AddHashtag(Hashtag hashtag) {
            if (_hashtags.Any(h => h.Id == hashtag.Id))
                return;

            _hashtags.Add(hashtag);
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemoveHashtag(Guid hashtagId) {
            Hashtag? tag = _hashtags.FirstOrDefault(h => h.Id == hashtagId);
            if (tag is null) return;

            _hashtags.Remove(tag);
            UpdatedAt = DateTime.UtcNow;
        }

        private static void Validate(string title) {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("All arguments are required");
        }

        public void AddLike(Guid userId) {
            if (_likes.Any(l => l.UserId == userId))
                return;

            var like = new Like(Id, userId);
            _likes.Add(like);
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemoveLike(Guid userId) {
            Like? like = _likes.FirstOrDefault(l => l.UserId == userId);
            if (like is null)
                return;

            _likes.Remove(like);
            UpdatedAt = DateTime.UtcNow;
        }
    }
}