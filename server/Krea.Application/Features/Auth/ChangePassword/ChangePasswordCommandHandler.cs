namespace Krea.Application.Features.Auth.ChangePassword {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    internal class ChangePasswordCommandHandler(
        IIdentityService identityService,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork
    ) : IRequestHandler<ChangePasswordCommand, bool> {
        public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken) {
            UserIdentity? identityUser = identityService.FindByIdAsync(request.UserId).Result;
            if (identityUser == null)
                return false;

            bool passwordChanged = identityService.ChangePasswordAsync(
                identityUser,
                request.CurrentPassword,
                request.NewPassword).Result;
            if (!passwordChanged)
                return false;

            User? domainUser = userRepository.GetByIdAsync(request.UserId, cancellationToken).Result;
            if (domainUser == null)
                return false;

            domainUser.SetPasswordReset();
            await userRepository.UpdateAsync(domainUser, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}