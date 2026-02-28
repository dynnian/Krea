using Krea.Application.Abstractions.Identity;
using Krea.Application.Abstractions.Auth;
using Krea.Application.Features.User;
using Krea.Domain.Entities;
using Krea.Domain.Abstractions;
using Krea.Domain.Repositories;

namespace Krea.Application.Features.Auth.Login;

internal class LoginQueryHandler : IRequestHandler<LoginQuery, AuthResponse>
{
    private readonly IIdentityService _identityService;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;

    public LoginQueryHandler(
        IIdentityService identityService,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        ITokenService tokenService)
    {
        _identityService = identityService;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var identityUser = await _identityService.FindByUsernameOrEmailAsync(request.EmailOrUsername);
        if (identityUser == null)
            throw new Exception("Invalid credentials.");

        var passwordValid = await _identityService.CheckPasswordAsync(identityUser, request.Password);
        if (!passwordValid)
            throw new Exception("Invalid credentials.");

        var domainUser = await _userRepository.GetByIdAsync(identityUser.Id, cancellationToken);
        if (domainUser == null)
            throw new Exception("User not found in domain.");

        domainUser.SetLastLogin();
        await _userRepository.UpdateAsync(domainUser, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = await _tokenService.GenerateTokenAsync(identityUser, domainUser);
        var userDto = MapToDto(domainUser, identityUser);

        return new AuthResponse(token.Token, token.Expiration, userDto);
    }

    private UserDto MapToDto(Domain.Entities.User domainUser, UserIdentity identity)
    {
        return new UserDto(
            domainUser.Id,
            identity.UserName,
            identity.Email,
            domainUser.DisplayName,
            domainUser.Biography,
            domainUser.LanguageCode,
            domainUser.TimeZoneId
        );
    }
}