namespace Krea.Application.Features.Commissions.UpdateCommissionOffering;

using Abstractions.Auth;
using Domain.Abstractions;
using Domain.Repositories;
using Domain.ValueObjects;
using Microsoft.Extensions.Logging;

public class UpdateCommissionOfferingCommandHandler(
    ICurrentUserService currentUserService,
    ICommissionOfferingRepository offeringRepository,
    IUnitOfWork unitOfWork,
    ILogger<UpdateCommissionOfferingCommandHandler> logger)
    : IRequestHandler<UpdateCommissionOfferingCommand, Unit>
{
    public async Task<Unit> Handle(UpdateCommissionOfferingCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId;
        if (currentUserId == Guid.Empty)
            throw new UnauthorizedAccessException();

        var offering = await offeringRepository.GetByIdForUpdateAsync(request.OfferingId, cancellationToken);
        if (offering == null)
            throw new Exception("Offering not found.");

        if (offering.Artist.Id != currentUserId)
            throw new UnauthorizedAccessException("Only the artist can update this offering.");
        
        var newPrice = new Money(request.Amount, request.Currency);

        offering.Update(request.Title, request.Description, newPrice, request.MaxSlots);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Offering {OfferingId} updated by artist {ArtistId}", request.OfferingId, currentUserId);
        return Unit.Value;
    }
}