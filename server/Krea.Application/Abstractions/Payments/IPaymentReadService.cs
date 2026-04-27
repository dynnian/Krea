namespace Krea.Application.Abstractions.Payments {
    using Features.Payments.Dtos;

    public interface IPaymentReadService {
        Task<PagedResult<PaymentSummaryDto>> GetSentPaymentsAsync(
            Guid userId,
            PaymentFilter filter,
            CancellationToken cancellationToken = default);

        Task<PagedResult<PaymentSummaryDto>> GetReceivedPaymentsAsync(
            Guid userId,
            PaymentFilter filter,
            CancellationToken cancellationToken = default);

        Task<PaymentReceiptDto?> GetPaymentReceiptDataAsync(
            Guid paymentId,
            CancellationToken cancellationToken = default);
    }

    public record PaymentFilter(
        string? PaymentType = null, // "Donation", "Commission", "Subscription"
        string? Status = null,      // "Pending", "Completed", "Failed"
        DateTime? From = null,
        DateTime? To = null,
        int Page = 1,
        int PageSize = 20);

    public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
}