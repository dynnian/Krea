namespace Krea.Application.Features.Commissions.ActivateOffering {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Repositories;
    using Microsoft.Extensions.Logging;

    public class ActivateOfferingCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionOfferingRepository offeringRepository,
        IUnitOfWork unitOfWork,
        ILogger<ActivateOfferingCommandHandler> logger)
        : IRequestHandler<ActivateOfferingCommand, Unit>
    {
        public async Task<Unit> Handle(ActivateOfferingCommand request, CancellationToken cancellationToken)
        {
            var currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            var offering = await offeringRepository.GetByIdAsync(request.OfferingId, cancellationToken);
            if (offering == null)
                throw new Exception("Offering not found.");
            if (offering.Artist.Id != currentUserId)
                throw new UnauthorizedAccessException();

            offering.Activate();
            await unitOfWork.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Offering {OfferingId} activated", request.OfferingId);
            return Unit.Value;
        }
    }
}