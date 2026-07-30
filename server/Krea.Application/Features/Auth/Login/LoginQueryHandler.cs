namespace Krea.Application.Features.Auth.Login {
    using Abstractions.Identity;
    using Application.Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Repositories;
    using User;
    using static Common.RoleHelper;
    using User = Domain.Entities.User;

    internal class LoginQueryHandler : IRequestHandler<LoginQuery, AuthResponse> {
        private readonly IIdentityService _identityService;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;

        public LoginQueryHandler(
            IIdentityService identityService,
            IUserRepository userRepository,
            IUnitOfWork unitOfWork,
            ITokenService tokenService) {
            _identityService = identityService;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
        }

        public async Task<AuthResponse> Handle(LoginQuery request, CancellationToken cancellationToken) {
            UserIdentity? identityUser = await _identityService.FindByUsernameOrEmailAsync(request.EmailOrUsername);
            if (identityUser == null)
                throw new Exception("Invalid credentials.");

            bool passwordValid = await _identityService.CheckPasswordAsync(identityUser, request.Password);
            if (!passwordValid)
                throw new Exception("Invalid credentials.");

            User? domainUser = await _userRepository.GetByIdAsync(identityUser.Id, cancellationToken);
            if (domainUser == null)
                throw new Exception("User not found in domain.");
            if (!domainUser.EmailConfirmed)
                throw new Exception("Email not confirmed. Please check your inbox.");

            domainUser.SetLastLogin();
            await _userRepository.UpdateAsync(domainUser, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            TokenGenerationResult tokens = await _tokenService.GenerateAuthTokensAsync(identityUser, domainUser);

            UserDto userDto = MapToDto(domainUser, identityUser);

            return new AuthResponse(tokens.AccessToken, tokens.AccessTokenExpiration, tokens.RefreshToken, userDto);
        }

        private UserDto MapToDto(User domainUser, UserIdentity identity) =>
            new(
                domainUser.Id,
                identity.UserName,
                identity.Email,
                domainUser.DisplayName,
                domainUser.Biography,
                domainUser.LanguageCode,
                domainUser.TimeZoneId,
                GetRoleInt(identity.Roles),
                domainUser.ProfilePicture?.Path
            );
    }
}