namespace Krea.Application.Features.Auth.ChangePassword {
    using Domain.Abstractions;

    public record ChangePasswordCommand(
        Guid UserId,
        string CurrentPassword,
        string NewPassword
    ) : IRequest<bool>;
}