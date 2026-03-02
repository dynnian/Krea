namespace Krea.Application.Features.Posts.Dto {
    using Domain.Abstractions;

    public sealed record UnlikePostCommand(
        Guid PostId,
        Guid UserId
    ) : IRequest<Unit>;
}