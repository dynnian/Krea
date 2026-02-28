namespace Krea.Application.Features.Posts.Dto {
    public sealed record ReplyPostCommand(
        Guid AuthorId,
        Guid ReplyToPostId,
        string Title,
        string Content
    );}