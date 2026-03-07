namespace Krea.Application.Features.Auth.Refresh {
    using Abstractions.Auth;
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using User;
    using static Common.RoleHelper;

    internal class RefreshTokenCommandHandler(
        ITokenService tokenService,
        IIdentityService identityService,
        IUserRepository userRepository)
        : IRequestHandler<RefreshTokenCommand, AuthResponse?> 
    {
        public async Task<AuthResponse?> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            TokenGenerationResult? tokens = await tokenService.RefreshAuthTokensAsync(request.RefreshToken);
            if (tokens == null)
                return null;

            UserIdentity? userIdentity = await identityService.FindByIdAsync(tokens.UserId);
            if (userIdentity == null)
                return null;

            User? domainUser = await userRepository.GetByIdAsync(tokens.UserId, cancellationToken);
            if (domainUser == null)
                return null;

            var userDto = new UserDto(
                domainUser.Id,
                userIdentity.UserName,
                userIdentity.Email,
                domainUser.DisplayName,
                domainUser.Biography,
                domainUser.LanguageCode,
                domainUser.TimeZoneId,
                GetRoleInt(userIdentity.Roles)
            );

            return new AuthResponse(tokens.AccessToken, tokens.AccessTokenExpiration, tokens.RefreshToken, userDto);
        }
    }
}