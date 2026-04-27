namespace Krea.Application.Features.Commissions.CreatePaymentForCommission {
    using Abstractions.Auth;
    using Abstractions.Payments;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class CreatePaymentForCommissionCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionRequestRepository requestRepository,
        IPaymentGateway paymentGateway,
        IUnitOfWork unitOfWork,
        ILogger<CreatePaymentForCommissionCommandHandler> logger)
        : IRequestHandler<CreatePaymentForCommissionCommand, CreatePaymentForCommissionResponse>
    {
        public async Task<CreatePaymentForCommissionResponse> Handle(
            CreatePaymentForCommissionCommand request,
            CancellationToken cancellationToken)
        {
            Guid payerId = currentUserService.UserId;
            if (payerId == Guid.Empty)
                throw new UnauthorizedAccessException();

            CommissionRequest? commissionRequest = await requestRepository.GetByIdWithPaymentsAsync(request.RequestId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            // Only the bidder can pay
            if (commissionRequest.Bidder.Id != payerId)
                throw new UnauthorizedAccessException("Only the bidder can pay for this commission.");

            // Check that status is Accepted or InProgress
            if (commissionRequest.Status != CommissionRequestStatus.Accepted &&
                commissionRequest.Status != CommissionRequestStatus.InProgress)
                throw new InvalidOperationException("Cannot pay for commission in current status.");

            // Create Stripe session
            CheckoutSessionResult session = await paymentGateway.CreateCheckoutSessionAsync(
                request.Amount,
                request.Currency,
                request.SuccessUrl,
                request.CancelUrl);

            // Create payment
            var amount = new Money(request.Amount, request.Currency);
            var externalRef = new ExternalPaymentRef("stripe", session.SessionId);
            commissionRequest.CreatePayment(commissionRequest.Bidder, amount, externalRef);
            
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Payment for commission {RequestId} created with Stripe session {SessionId}",
                request.RequestId, session.SessionId);

            return new CreatePaymentForCommissionResponse(session.Url);
        }
    }
}