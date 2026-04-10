namespace Krea.Application.Features.Commissions.DeleteOffering {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class DeleteOfferingCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionOfferingRepository offeringRepository,
        ICommissionRequestRepository requestRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteOfferingCommandHandler> logger)
        : IRequestHandler<DeleteOfferingCommand, Unit>
    {
        public async Task<Unit> Handle(DeleteOfferingCommand request, CancellationToken cancellationToken)
        {
            var currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            var offering = await offeringRepository.GetByIdAsync(request.OfferingId, cancellationToken);
            if (offering == null)
                throw new Exception("Offering not found.");
            if (offering.Artist.Id != currentUserId)
                throw new UnauthorizedAccessException();

            // Check if there are any requests that are not completed/canceled
            var requests = await requestRepository.GetByOfferingAsync(request.OfferingId, cancellationToken);
            if (requests.Any(r => r.Status != CommissionRequestStatus.Completed && r.Status != CommissionRequestStatus.Cancelled))
                throw new InvalidOperationException("Cannot delete offering with active or pending requests.");

            await offeringRepository.DeleteAsync(offering, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Offering {OfferingId} deleted by artist {ArtistId}", request.OfferingId, currentUserId);
            return Unit.Value;
        }
    }
}