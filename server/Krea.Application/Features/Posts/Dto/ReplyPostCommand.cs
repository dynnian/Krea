namespace Krea.Application.Features.Posts.Dto {
    using Domain.Abstractions;

    public sealed record ReplyPostCommand(
        Guid ReplyToPostId,
        Guid AuthorId,
        string Title,
        string Content
    ) : IRequest<Guid>;
}