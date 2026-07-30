namespace Krea.Application.Features.Follows {
    using Domain.Abstractions;

    public sealed record FollowUserCommand(
        Guid SourceId,
        Guid TargetId
    ) : IRequest<Unit>;
}