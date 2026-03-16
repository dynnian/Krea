namespace Krea.Application.Features.Posts.GetPostById {
    public sealed record GetPostByIdResponse(
        Guid Id,
        Guid AuthorPostId,
        string Title,
        string? Content,
        bool IsWork,
        bool IsLocal,
        int UploadCount,
        int LikesCount,
        DateTime UploadedAt
    );
}