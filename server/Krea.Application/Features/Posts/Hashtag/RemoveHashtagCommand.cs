namespace Krea.Application.Features.Posts.Hashtag {
    using Domain.Abstractions;

    public sealed record RemoveHashtagCommand(
        Guid PostId,
        Guid HashtagId
    ) : IRequest<Unit>;
}