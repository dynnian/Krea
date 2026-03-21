namespace Krea.Application.Features.Posts.GetPostById {
    using Dto;

    public sealed record GetPostByIdResponse(
        Guid Id,
        Guid AuthorPostId,
        string Title,
        string? Content,
        bool IsWork,
        bool IsLocal,
        int UploadCount,
        int LikesCount,
        DateTime UploadedAt,

        IReadOnlyList<PostMediaDto> Media,

        bool IsLikedByCurrentUser,
        bool IsRetweetedByCurrentUser,

        IReadOnlyList<ReplyDto> Replies
    );
}