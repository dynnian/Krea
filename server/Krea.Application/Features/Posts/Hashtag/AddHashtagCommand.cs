namespace Krea.Application.Features.Posts.Hashtag {
    using Domain.Abstractions;

    public sealed record AddHashtagCommand(
        Guid PostId,
        string Name
    ) : IRequest<Unit>;
}