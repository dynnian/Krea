namespace Krea.Application.Features.Commissions.CreateCommissionRequest {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.Extensions.Logging;

    public class CreateCommissionRequestCommandHandler(
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        ICommissionOfferingRepository offeringRepository,
        ICommissionRequestRepository requestRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateCommissionRequestCommandHandler> logger)
        : IRequestHandler<CreateCommissionRequestCommand, CreateCommissionRequestResponse> {
        public async Task<CreateCommissionRequestResponse> Handle(
            CreateCommissionRequestCommand request,
            CancellationToken cancellationToken) {
            Guid bidderId = currentUserService.UserId;
            if (bidderId == Guid.Empty)
                throw new UnauthorizedAccessException();

            User? bidder = await userRepository.GetByIdAsync(bidderId, cancellationToken);
            if (bidder == null)
                throw new Exception("Bidder not found.");

            CommissionOffering? offering = await offeringRepository.GetByIdAsync(request.OfferingId);
            if (offering == null)
                throw new Exception("Offering not found.");
            if (!offering.IsActive)
                throw new InvalidOperationException("Offering is not active.");

            // Implement later: Check if max slots are reached

            var commissionRequest = new CommissionRequest(bidder, offering, request.Brief);

            await requestRepository.AddAsync(commissionRequest, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Commission request {RequestId} created for offering {OfferingId} by user {BidderId}",
                commissionRequest.Id, offering.Id, bidderId);

            return new CreateCommissionRequestResponse(commissionRequest.Id);
        }
    }
}