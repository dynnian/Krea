namespace Krea.Application.Abstractions.Payments {
    using Domain.ValueObjects;

    public record PaymentParentInfo(Guid ParentId, PaymentParentType ParentType, Guid PaymentId);

    public enum PaymentParentType {
        CommissionRequest,
        Donation,
        Subscription
    }

    public interface IPaymentQueryService {
        Task<PaymentParentInfo?> GetParentByExternalRefAsync(ExternalPaymentRef externalRef,
                                                             CancellationToken cancellationToken = default);
    }
}