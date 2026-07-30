namespace Krea.Application.Features.Admin.Users {
    using Domain.Abstractions;

    public sealed record DeleteAdminUserCommand(
        Guid ActorUserId,
        Guid UserId
    ) : IRequest<Unit>;
}