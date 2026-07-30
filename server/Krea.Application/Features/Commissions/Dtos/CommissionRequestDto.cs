namespace Krea.Application.Features.Commissions.Dtos {
    public record CommissionRequestDto(
        Guid Id,
        string Brief,
        string Status,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        CommissionOfferingMinimalDto Offering,
        BidderInfoDto Bidder,
        IReadOnlyCollection<PaymentInfoDto> Payments,
        IReadOnlyCollection<SubmissionDto> Submissions);

    public record CommissionOfferingMinimalDto(Guid Id, string Title, decimal BasePrice, string Currency);

    public record BidderInfoDto(Guid Id, string DisplayName);

    public record PaymentInfoDto(Guid Id, decimal Amount, string Currency, string Status, DateTime? PaidAt);
}