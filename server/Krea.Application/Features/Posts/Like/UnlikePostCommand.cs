namespace Krea.Application.Features.Posts.Like {
    using Domain.Abstractions;

    public sealed record UnlikePostCommand(
        Guid PostId,
        Guid UserId
    ) : IRequest<Unit>;
}