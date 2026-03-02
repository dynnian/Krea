namespace Krea.Application.Features.Posts.Dto {
    using Domain.Abstractions;

    public sealed record LikePostCommand(
        Guid PostId,
        Guid UserId
    ) : IRequest<Unit>;
}