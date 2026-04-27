using Krea.Domain.Abstractions;

namespace Krea.Application.Features.Donations.CreateDonation {
    public record CreateDonationCommand(
        Guid RecipientId,
        decimal Amount,
        string Currency,
        string? Message,
        string SuccessUrl,
        string CancelUrl
    ) : IRequest<CreateDonationResponse>;

    public record CreateDonationResponse(Guid DonationId, string CheckoutUrl);
}