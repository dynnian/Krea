namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Payments;
    using Data;
    using Domain.ValueObjects;
    using Microsoft.EntityFrameworkCore;

    public class PaymentQueryService : IPaymentQueryService {
        private readonly AppDbContext _dbContext;

        public PaymentQueryService(AppDbContext dbContext) => _dbContext = dbContext;

        public async Task<PaymentParentInfo?> GetParentByExternalRefAsync(
            ExternalPaymentRef externalRef, CancellationToken cancellationToken) {
            // Find payment and parent
            var payment = await _dbContext.Payments
                                          .Where(p => p.ExternalRef.Provider == externalRef.Provider &&
                                                      p.ExternalRef.Value == externalRef.Value)
                                          .Select(p => new {
                                              p.Id,
                                              CommissionRequestId =
                                                  p.CommissionRequest != null ? p.CommissionRequest.Id : (Guid?)null,
                                              DonationId = p.Donation != null ? p.Donation.Id : (Guid?)null,
                                              SubscriptionId = p.Subscription != null ? p.Subscription.Id : (Guid?)null
                                          })
                                          .FirstOrDefaultAsync(cancellationToken);

            if (payment == null)
                return null;

            if (payment.CommissionRequestId.HasValue) {
                return new PaymentParentInfo(payment.CommissionRequestId.Value, PaymentParentType.CommissionRequest,
                    payment.Id);
            }

            if (payment.DonationId.HasValue)
                return new PaymentParentInfo(payment.DonationId.Value, PaymentParentType.Donation, payment.Id);
            return payment.SubscriptionId.HasValue
                ? new PaymentParentInfo(payment.SubscriptionId.Value, PaymentParentType.Subscription, payment.Id)
                : null;
        }
    }
}