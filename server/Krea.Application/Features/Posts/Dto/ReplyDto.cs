namespace Krea.Application.Features.Posts.Dto {
    public sealed record ReplyDto(
        Guid Id,
        Guid AuthorId,
        string AuthorName,
        string Content,
        DateTime CreatedAt
    );
}