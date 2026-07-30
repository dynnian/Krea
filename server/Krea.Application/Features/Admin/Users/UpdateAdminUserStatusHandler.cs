namespace Krea.Application.Features.Admin.Users {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class UpdateAdminUserStatusHandler : IRequestHandler<UpdateAdminUserStatusCommand, Unit> {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateAdminUserStatusHandler(IUserRepository userRepository, IUnitOfWork unitOfWork) {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(UpdateAdminUserStatusCommand request, CancellationToken cancellationToken) {
            User? user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user is null)
                throw new KeyNotFoundException("User not found.");

            switch (request.Status) {
                case AdminUserStatus.Active:
                    user.Unsuspend();
                    user.Unban();
                    break;
                case AdminUserStatus.Suspended:
                    user.Suspend();
                    user.Unban();
                    break;
                case AdminUserStatus.Banned:
                    user.Suspend();
                    user.Ban();
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(request.Status), request.Status, null);
            }

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}