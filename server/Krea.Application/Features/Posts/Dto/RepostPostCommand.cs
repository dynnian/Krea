namespace Krea.Application.Features.Posts.Dto {
    public sealed record RepostPostCommand(
        Guid AuthorId,
        Guid OriginalPostId
    );
}