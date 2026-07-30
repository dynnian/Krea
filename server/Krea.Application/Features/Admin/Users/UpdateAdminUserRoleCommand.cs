namespace Krea.Application.Features.Admin.Users {
    using Domain.Abstractions;

    public sealed record UpdateAdminUserRoleCommand(
        Guid ActorUserId,
        Guid UserId,
        string Role
    ) : IRequest<Unit>;
}