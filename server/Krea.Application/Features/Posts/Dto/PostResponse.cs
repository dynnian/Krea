namespace Krea.Application.Features.Posts.Dto {
    public sealed record PostResponse(
        Guid Id,
        Guid AuthorId,
        string AuthorName,
        string Content,
        DateTime CreatedAt
    );
}