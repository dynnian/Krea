namespace Krea.Application.Features.Posts.Dto { 
    public sealed class PostFeedResponse {
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Content { get; init; } = string.Empty;

    public Guid AuthorId { get; init; }
    
    public string AuthorUsername { get; init; } = string.Empty;

    public DateTime UploadedAt { get; init; }
    
    public string? MediaPreviewUrl { get; init; }

    public string? MediaMimeType { get; init; }

    public int LikeCount { get; init; }

    public bool IsLikedByCurrentUser { get; init; }
    
    public bool IsFavorite { get; set; }

    public int ReplyCount { get; init; }

    public int RepostCount { get; init; } 
    } 
}