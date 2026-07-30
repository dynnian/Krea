namespace Krea.Application.Features.Commissions.ApproveCommission {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class ApproveCommissionCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionRequestRepository requestRepository,
        IUnitOfWork unitOfWork,
        ILogger<ApproveCommissionCommandHandler> logger)
        : IRequestHandler<ApproveCommissionCommand, Unit> {
        public async Task<Unit> Handle(
            ApproveCommissionCommand request,
            CancellationToken cancellationToken) {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            CommissionRequest? commissionRequest =
                await requestRepository.GetByIdWithOfferingForUpdateAsync(request.RequestId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            // Only the bidder can approve
            if (commissionRequest.Bidder.Id != currentUserId)
                throw new UnauthorizedAccessException("Only the bidder can approve.");

            if (commissionRequest.Status != CommissionRequestStatus.Delivered)
                throw new InvalidOperationException("Only delivered commissions can be approved.");

            commissionRequest.Approve();
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Commission {RequestId} approved by bidder {BidderId}",
                request.RequestId, currentUserId);

            return Unit.Value;
        }
    }
}