namespace Krea.Application.Features.Donations.Dtos {
    public record DonationDto(
        Guid Id,
        decimal Amount,
        string Currency,
        string Message,
        DateTime DonatedAt,
        string Status,
        string RecipientName,
        Guid RecipientId,
        string? PaymentId);
}