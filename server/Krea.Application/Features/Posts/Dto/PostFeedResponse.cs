namespace Krea.Application.Features.Posts.Dto { 
    public sealed class PostFeedResponse {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public Guid AuthorId { get; set; }
        public string AuthorUsername { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }

        public string? MediaPreviewUrl { get; set; }
        public string? MediaMimeType { get; set; }
        public Guid? CoverMediaId { get; set; }
        public string? CoverUrl { get; set; }
        public string? CoverMimeType { get; set; }

        public int LikeCount { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
        public bool IsRetweetedByCurrentUser { get; set; }
        public bool IsFavorite { get; set; }
        public int ReplyCount { get; set; }
        public int RepostCount { get; set; }

        public Guid? RepostOfId { get; set; }
        public RepostFeedReferenceDto? RepostOf { get; set; }
    } 
}