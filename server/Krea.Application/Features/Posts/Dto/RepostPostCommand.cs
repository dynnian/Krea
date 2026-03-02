namespace Krea.Application.Features.Posts.Dto {
    using Domain.Abstractions;

    public sealed record RepostPostCommand(
        Guid AuthorId,
        Guid OriginalPostId
    ): IRequest<Guid>;
}