using Krea.Domain.Abstractions;

namespace Krea.Application.Features.Donations.GetUserDonations {
    using Abstractions.Payments;
    using Dtos;

    public record GetUserDonationsQuery(
        Guid UserId,
        string? Status = null,
        int Page = 1,
        int PageSize = 20) : IRequest<PagedResult<DonationDto>>;
}