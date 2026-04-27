namespace Krea.Application.Features.Commissions.RequestChanges {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class RequestChangesCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionRequestRepository requestRepository,
        IUnitOfWork unitOfWork,
        ILogger<RequestChangesCommandHandler> logger)
        : IRequestHandler<RequestChangesCommand, Unit> {
        public async Task<Unit> Handle(
            RequestChangesCommand request,
            CancellationToken cancellationToken) {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            CommissionRequest? commissionRequest =
                await requestRepository.GetByIdWithOfferingForUpdateAsync(request.RequestId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            // Only the bidder can request changes
            if (commissionRequest.Bidder.Id != currentUserId)
                throw new UnauthorizedAccessException("Only the bidder can request changes.");

            if (commissionRequest.Status != CommissionRequestStatus.Delivered)
                throw new InvalidOperationException("Only delivered commissions can be changed.");

            commissionRequest.RequestChanges();
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Changes requested for commission {RequestId} by bidder {BidderId}",
                request.RequestId, currentUserId);

            return Unit.Value;
        }
    }
}