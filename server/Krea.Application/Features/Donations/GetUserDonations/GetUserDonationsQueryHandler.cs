using Krea.Domain.Abstractions;
using Krea.Domain.Repositories;

namespace Krea.Application.Features.Donations.GetUserDonations {
    using Abstractions.Payments;
    using Domain.Entities;
    using Domain.ValueObjects;
    using Dtos;

    public class GetUserDonationsQueryHandler(
        IDonationRepository donationRepository)
        : IRequestHandler<GetUserDonationsQuery, PagedResult<DonationDto>> {
        public async Task<PagedResult<DonationDto>> Handle(GetUserDonationsQuery request,
                                                           CancellationToken cancellationToken) {
            IReadOnlyList<Donation> donations =
                await donationRepository.GetByDonorAsync(request.UserId, cancellationToken);

            // Apply status filter if needed
            if (!string.IsNullOrEmpty(request.Status)) {
                var statusEnum = Enum.Parse<PaymentStatus>(request.Status, true);
                donations = donations.Where(d => d.Payments.Any(p => p.Status == statusEnum)).ToList();
            }

            int totalCount = donations.Count;
            List<DonationDto> pagedItems = donations
                                           .Skip((request.Page - 1) * request.PageSize)
                                           .Take(request.PageSize)
                                           .Select(d => new DonationDto(
                                               d.Id,
                                               d.Amount.Amount,
                                               d.Amount.Currency,
                                               d.Message,
                                               d.DonatedAt,
                                               d.Payments.FirstOrDefault()?.Status.ToString() ?? "Pending",
                                               d.Recipient.DisplayName,
                                               d.Recipient.Id,
                                               d.Payments.FirstOrDefault()?.Id.ToString()
                                           ))
                                           .ToList();

            // Use the PagedResult from Posts.Explore
            return new PagedResult<DonationDto>(pagedItems, totalCount, request.Page, request.PageSize);
        }
    }
}