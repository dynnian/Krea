namespace Krea.Application.Features.Posts.Repost {
    using Domain.Abstractions;

    public sealed record RepostPostCommand(
        Guid AuthorId,
        Guid OriginalPostId
    ) : IRequest<Guid>;
}