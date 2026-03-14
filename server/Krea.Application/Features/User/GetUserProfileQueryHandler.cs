namespace Krea.Application.Features.User {
    using Abstractions.Identity;
    using static Common.RoleHelper;
    using Domain.Abstractions;
    using Domain.Repositories;

    public sealed class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserDto?> {
        private readonly IUserRepository _userRepository;
        private readonly IIdentityService _identityService;

        public GetUserProfileQueryHandler(
            IUserRepository userRepository,
            IIdentityService identityService) {
            _userRepository = userRepository;
            _identityService = identityService;
        }

        public async Task<UserDto?> Handle(
            GetUserProfileQuery request,
            CancellationToken cancellationToken) {
            Domain.Entities.User? domainUser = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (domainUser is null)
                return null;

            UserIdentity? identityUser = await _identityService.FindByIdAsync(request.UserId);
            if (identityUser is null)
                return null;

            return new UserDto(
                domainUser.Id,
                identityUser.UserName,
                identityUser.Email,
                domainUser.DisplayName,
                domainUser.Biography,
                domainUser.LanguageCode,
                domainUser.TimeZoneId,
                GetRoleInt(identityUser.Roles)
            );
        }
    }
}
