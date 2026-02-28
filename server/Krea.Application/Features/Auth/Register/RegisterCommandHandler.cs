using Krea.Application.Abstractions.Identity;
using Krea.Application.Abstractions.Auth;
using Krea.Application.Features.User;
using Krea.Domain.Abstractions;
using Krea.Domain.Entities;
using Krea.Domain.Repositories;

namespace Krea.Application.Features.Auth.Register;

internal class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IIdentityService _identityService;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;

    public RegisterCommandHandler(
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

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // 1. Check uniqueness
        if (await _identityService.FindByUsernameAsync(request.Username) != null)
            throw new Exception("Username already taken.");
        if (await _identityService.FindByEmailAsync(request.Email) != null)
            throw new Exception("Email already registered.");

        // 2. Create domain user
        var domainUser = new Domain.Entities.User(
            request.DisplayName,
            request.LanguageCode,
            request.TimeZoneId,
            request.Biography);

        // 3. Prepare UserIdentity for creation
        var newUserIdentity = new UserIdentity(
            domainUser.Id,
            request.Username,
            request.Email,
            new List<string>()
        );

        var createResult = await _identityService.CreateUserAsync(newUserIdentity, request.Password);
        if (!createResult.Succeeded)
            throw new Exception(string.Join(", ", createResult.Errors));

        // 4. Save domain user
        await _userRepository.AddAsync(domainUser);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 5. Fetch the created identity (to get roles, etc.)
        var createdIdentity = await _identityService.FindByUsernameAsync(request.Username);
        if (createdIdentity == null)
            throw new Exception("User creation succeeded but could not retrieve identity.");

        // 6. Generate token
        var token = await _tokenService.GenerateTokenAsync(createdIdentity, domainUser);
        var userDto = MapToDto(domainUser, createdIdentity);

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