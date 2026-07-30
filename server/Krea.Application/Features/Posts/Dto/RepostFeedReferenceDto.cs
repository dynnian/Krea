namespace Krea.Application.Features.Posts.Dto {
    public sealed class RepostFeedReferenceDto {
        public Guid Id { get; set; }
        public Guid AuthorId { get; set; }
        public string AuthorUsername { get; set; } = string.Empty;
        public string? AuthorProfilePictureUrl { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public DateTime UploadedAt { get; set; }
        public string? MediaPreviewUrl { get; set; }
        public string? MediaMimeType { get; set; }
        public Guid? CoverMediaId { get; set; }
        public string? CoverUrl { get; set; }
        public string? CoverMimeType { get; set; }
        public IReadOnlyList<string> Genres { get; init; } = [];
        public int LikeCount { get; set; }
        public int ReplyCount { get; set; }
        public int RepostCount { get; set; }
    }
}