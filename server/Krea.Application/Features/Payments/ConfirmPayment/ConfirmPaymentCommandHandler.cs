namespace Krea.Application.Features.Payments.ConfirmPayment {
    using Abstractions.Payments;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class ConfirmPaymentCommandHandler(
        IPaymentQueryService paymentQueryService,
        ICommissionRequestRepository commissionRepo,
        IDonationRepository donationRepo,
        ISubscriptionRepository subscriptionRepo,
        IUnitOfWork unitOfWork,
        ILogger<ConfirmPaymentCommandHandler> logger)
        : IRequestHandler<ConfirmPaymentCommand, Unit> {
        public async Task<Unit> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken) {
            var externalRef = new ExternalPaymentRef(request.Provider, request.ExternalId);
            PaymentParentInfo? parentInfo =
                await paymentQueryService.GetParentByExternalRefAsync(externalRef, cancellationToken);
            if (parentInfo == null) {
                logger.LogWarning("No parent found for external ref {Provider}:{ExternalId}", request.Provider,
                    request.ExternalId);
                return Unit.Value;
            }

            logger.LogInformation("Parent found: Type={ParentType}, ParentId={ParentId}, PaymentId={PaymentId}",
                parentInfo.ParentType, parentInfo.ParentId, parentInfo.PaymentId);

            // Load the appropriate aggregate root
            switch (parentInfo.ParentType) {
                case PaymentParentType.CommissionRequest:
                    CommissionRequest? commission =
                        await commissionRepo.GetByIdWithPaymentsAsync(parentInfo.ParentId, cancellationToken);
                    if (commission is null) throw new InvalidOperationException("Commission request not found.");
                    commission.ConfirmPayment(parentInfo.PaymentId);
                    break;

                case PaymentParentType.Donation:
                    Donation? donation =
                        await donationRepo.GetByIdWithPaymentsAsync(parentInfo.ParentId, cancellationToken);
                    if (donation is null) throw new InvalidOperationException("Donation not found.");
                    donation.ConfirmPayment(parentInfo.PaymentId);
                    break;

                case PaymentParentType.Subscription:
                    Subscription? subscription =
                        await subscriptionRepo.GetByIdWithPaymentsAsync(parentInfo.ParentId, cancellationToken);
                    if (subscription is null) throw new InvalidOperationException("Subscription not found.");
                    subscription.ConfirmPayment(parentInfo.PaymentId);
                    break;

                default:
                    throw new ArgumentOutOfRangeException();
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}