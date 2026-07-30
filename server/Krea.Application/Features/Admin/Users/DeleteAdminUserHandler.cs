namespace Krea.Application.Features.Admin.Users {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class DeleteAdminUserHandler : IRequestHandler<DeleteAdminUserCommand, Unit> {
        private readonly IUserRepository _userRepository;
        private readonly IIdentityService _identityService;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteAdminUserHandler(
            IUserRepository userRepository,
            IIdentityService identityService,
            IUnitOfWork unitOfWork) {
            _userRepository = userRepository;
            _identityService = identityService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(DeleteAdminUserCommand request, CancellationToken cancellationToken) {
            if (request.ActorUserId == request.UserId)
                throw new InvalidOperationException("You cannot delete your own account.");

            User? domainUser = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (domainUser is null)
                throw new KeyNotFoundException("User not found.");

            UserIdentity? identityUser = await _identityService.FindByIdAsync(request.UserId);
            if (identityUser is null)
                throw new KeyNotFoundException("Identity user not found.");

            bool isAdmin = identityUser.Roles.Any(r => r.Equals("Admin", StringComparison.OrdinalIgnoreCase));
            if (isAdmin) {
                int adminsCount = await _identityService.CountUsersInRoleAsync("Admin", cancellationToken);
                if (adminsCount <= 1)
                    throw new InvalidOperationException("Cannot delete the last Admin user in the instance.");
            }

            (bool succeeded, string[] errors) = await _identityService.DeleteUserAsync(request.UserId);
            if (!succeeded)
                throw new ArgumentException(string.Join(", ", errors));

            // Deleting identity can cascade-delete the mapped domain user (same PK).
            User? remainingDomainUser = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (remainingDomainUser is not null) {
                await _userRepository.RemoveAsync(remainingDomainUser, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return Unit.Value;
        }
    }
}