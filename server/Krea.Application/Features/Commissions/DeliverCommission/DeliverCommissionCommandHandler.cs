namespace Krea.Application.Features.Commissions.DeliverCommission
{
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class DeliverCommissionCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionRequestRepository requestRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeliverCommissionCommandHandler> logger)
        : IRequestHandler<DeliverCommissionCommand, Unit>
    {
        public async Task<Unit> Handle(
            DeliverCommissionCommand request,
            CancellationToken cancellationToken)
        {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();
            
            CommissionRequest? commissionRequest = await requestRepository.GetByIdWithOfferingForUpdateAsync(request.RequestId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            // Ensure the required navigation properties are loaded
            if (commissionRequest.Offering?.Artist == null)
                throw new InvalidOperationException("Commission request data is incomplete.");

            // Only the artist can deliver
            if (commissionRequest.Offering.Artist.Id != currentUserId)
                throw new UnauthorizedAccessException("Only the artist can deliver.");

            if (commissionRequest.Status != CommissionRequestStatus.InProgress)
                throw new InvalidOperationException("Commission must be in progress to deliver.");

            commissionRequest.Deliver();
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Commission {RequestId} delivered by artist {ArtistId}",
                request.RequestId, currentUserId);

            return Unit.Value;
        }
    }
}