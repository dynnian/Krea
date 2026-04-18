namespace Krea.Application.Features.Admin.Users {
    using Domain.Abstractions;

    public sealed record UpdateAdminUserStatusCommand(
        Guid UserId,
        AdminUserStatus Status
    ) : IRequest<Unit>;
}