// Krea.Application/Features/Auth/ConfirmEmail/ConfirmEmailCommandHandler.cs
using Krea.Application.Abstractions.Identity;
using Krea.Domain.Abstractions;
using Krea.Domain.Entities;
using Krea.Domain.Repositories;

namespace Krea.Application.Features.Auth.ConfirmEmail;

internal class ConfirmEmailCommandHandler : IRequestHandler<ConfirmEmailCommand, bool>
{
    private readonly IIdentityService _identityService;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ConfirmEmailCommandHandler(
        IIdentityService identityService,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _identityService = identityService;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
    {
        // Retrieve identity user
        var identityUser = await _identityService.FindByIdAsync(request.UserId);
        if (identityUser == null)
            return false; 

        // Confirm email using Identity
        var confirmed = await _identityService.ConfirmEmailAsync(identityUser, request.Token);
        if (!confirmed)
            return false;

        // Update domain user
        var domainUser = await _userRepository.GetByIdAsync(request.UserId,  cancellationToken);
        if (domainUser == null)
            return false;

        domainUser.ConfirmEmail();
        await _userRepository.UpdateAsync(domainUser, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}