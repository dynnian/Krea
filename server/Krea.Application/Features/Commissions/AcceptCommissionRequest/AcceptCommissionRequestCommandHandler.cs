namespace Krea.Application.Features.Commissions.AcceptCommissionRequest {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class AcceptCommissionRequestCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionRequestRepository requestRepository,
        ICommissionOfferingRepository offeringRepository,
        IUnitOfWork unitOfWork,
        ILogger<AcceptCommissionRequestCommandHandler> logger)
        : IRequestHandler<AcceptCommissionRequestCommand, Unit> {
        public async Task<Unit> Handle(AcceptCommissionRequestCommand request, CancellationToken cancellationToken) {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            // Load the request
            CommissionRequest? commissionRequest =
                await requestRepository.GetByIdWithOfferingForUpdateAsync(request.RequestId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            if (commissionRequest.Offering?.Artist == null)
                throw new InvalidOperationException("Commission request data is incomplete.");

            // Enforce Max Slots
            CommissionOffering offering = commissionRequest.Offering;
            int activeCount = await offeringRepository.GetActiveRequestCountAsync(offering.Id, cancellationToken);
            if (activeCount >= offering.MaxSlots) {
                throw new InvalidOperationException(
                    "This offering has reached its maximum number of active commissions.");
            }

            // Only the artist who owns the offering can accept
            if (commissionRequest.Offering.Artist.Id != currentUserId)
                throw new UnauthorizedAccessException("Only the artist can accept this commission.");

            if (commissionRequest.Status != CommissionRequestStatus.Pending)
                throw new InvalidOperationException("Commission request is not pending.");


            commissionRequest.Accept();

            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Commission request {RequestId} accepted by artist {ArtistId}",
                request.RequestId, currentUserId);

            return Unit.Value;
        }
    }
}