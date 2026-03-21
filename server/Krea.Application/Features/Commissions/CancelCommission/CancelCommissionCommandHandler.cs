namespace Krea.Application.Features.Commissions.CancelCommission {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class CancelCommissionCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionRequestRepository requestRepository,
        IUnitOfWork unitOfWork,
        ILogger<CancelCommissionCommandHandler> logger)
        : IRequestHandler<CancelCommissionCommand, Unit>
    {
        public async Task<Unit> Handle(
            CancelCommissionCommand request,
            CancellationToken cancellationToken)
        {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            CommissionRequest? commissionRequest = await requestRepository.GetByIdWithOfferingForUpdateAsync(
                request.RequestId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            // Determine if the user is the bidder or the artist
            bool isBidder = commissionRequest.Bidder.Id == currentUserId;
            bool isArtist = commissionRequest.Offering.Artist.Id == currentUserId;

            if (!isBidder && !isArtist)
                throw new UnauthorizedAccessException("Only the bidder or artist can cancel.");

            // Artist can only cancel if status is Pending
            if (isArtist && commissionRequest.Status != CommissionRequestStatus.Pending)
                throw new InvalidOperationException("Artist can only cancel pending commissions.");

            // Bidder can cancel as long as not completed/delivered
            commissionRequest.Cancel();
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Commission {RequestId} cancelled by user {UserId}",
                request.RequestId, currentUserId);

            return Unit.Value;
        }
    }
}