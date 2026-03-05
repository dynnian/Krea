namespace Krea.Application.Features.Posts.Dto { 
    public sealed class PostFeedResponse {
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Content { get; init; } = string.Empty;

    public Guid AuthorId { get; init; }

    public DateTime UploadedAt { get; init; }

    public int LikeCount { get; init; }

    public bool IsLikedByCurrentUser { get; init; }

    public int ReplyCount { get; init; }

    public int RepostCount { get; init; } 
    } 
}