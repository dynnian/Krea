namespace Krea.Application.Features.Payments.Dtos {
    public record PaymentSummaryDto(
        Guid PaymentId,
        string PaymentType, // "Donation", "Commission", "Subscription"
        decimal Amount,
        string Currency,
        string Status,
        DateTime? PaidAt,
        string CounterpartyName, // Recipient for sent payments, Payer for received
        string? Reference,
        string? EntityId); // DonationId, CommissionRequestId, etc.

    public record PaymentReceiptDto(
        Guid PaymentId,
        string PaymentType,
        decimal Amount,
        string Currency,
        string Status,
        DateTime PaidAt,
        string PayerName,
        string RecipientName,
        string? Reference,
        string? AdditionalInfo);
}