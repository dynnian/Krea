namespace Krea.Application.Features.Posts.Like {
    using Domain.Abstractions;

    public sealed record LikePostCommand(
        Guid PostId,
        Guid UserId
    ) : IRequest<Unit>;
}