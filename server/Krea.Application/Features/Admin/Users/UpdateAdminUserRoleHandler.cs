namespace Krea.Application.Features.Admin.Users {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class UpdateAdminUserRoleHandler : IRequestHandler<UpdateAdminUserRoleCommand, Unit> {
        private readonly IUserRepository _userRepository;
        private readonly IIdentityService _identityService;

        public UpdateAdminUserRoleHandler(IUserRepository userRepository, IIdentityService identityService) {
            _userRepository = userRepository;
            _identityService = identityService;
        }

        public async Task<Unit> Handle(UpdateAdminUserRoleCommand request, CancellationToken cancellationToken) {
            if (string.IsNullOrWhiteSpace(request.Role))
                throw new ArgumentException("Role is required.");

            User? domainUser = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (domainUser is null)
                throw new KeyNotFoundException("User not found.");

            string targetRole = request.Role.Trim();

            // Guardrail: admin should not be able to demote themselves out of Admin.
            if (request.ActorUserId == request.UserId &&
                !targetRole.Equals("Admin", StringComparison.OrdinalIgnoreCase)) {
                throw new InvalidOperationException("You cannot remove your own Admin role.");
            }

            UserIdentity? currentIdentity = await _identityService.FindByIdAsync(request.UserId);
            if (currentIdentity is null)
                throw new KeyNotFoundException("Identity user not found.");

            bool currentlyAdmin = currentIdentity.Roles.Any(r => r.Equals("Admin", StringComparison.OrdinalIgnoreCase));
            bool targetIsAdmin = targetRole.Equals("Admin", StringComparison.OrdinalIgnoreCase);

            if (currentlyAdmin && !targetIsAdmin) {
                int adminsCount = await _identityService.CountUsersInRoleAsync("Admin", cancellationToken);
                if (adminsCount <= 1) {
                    throw new InvalidOperationException("Cannot remove the last Admin role in the instance.");
                }
            }

            (bool Succeeded, string[] Errors) = await _identityService.SetUserRolesAsync(
                request.UserId,
                [targetRole]);

            if (!Succeeded)
                throw new ArgumentException(string.Join(", ", Errors));

            return Unit.Value;
        }
    }
}