namespace Krea.Application.Features.Follows {
    using Domain.Abstractions;

    public sealed record UnfollowUserCommand(
        Guid SourceId,
        Guid TargetId
    ) : IRequest<Unit>;}