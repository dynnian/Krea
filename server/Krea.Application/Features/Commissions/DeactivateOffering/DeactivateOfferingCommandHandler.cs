namespace Krea.Application.Features.Commissions.DeactivateOffering {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.Extensions.Logging;

    public class DeactivateOfferingCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionOfferingRepository offeringRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeactivateOfferingCommandHandler> logger)
        : IRequestHandler<DeactivateOfferingCommand, Unit> {
        public async Task<Unit> Handle(DeactivateOfferingCommand request, CancellationToken cancellationToken) {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            CommissionOffering? offering = await offeringRepository.GetByIdAsync(request.OfferingId, cancellationToken);
            if (offering == null)
                throw new Exception("Offering not found.");
            if (offering.Artist.Id != currentUserId)
                throw new UnauthorizedAccessException();

            offering.Deactivate();
            await unitOfWork.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Offering {OfferingId} deactivated", request.OfferingId);
            return Unit.Value;
        }
    }
}