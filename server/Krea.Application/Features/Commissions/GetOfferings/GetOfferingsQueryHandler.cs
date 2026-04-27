namespace Krea.Application.Features.Commissions.GetOfferings {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dtos;
    using Microsoft.Extensions.Logging;

    public class GetOfferingsQueryHandler(
        ICurrentUserService currentUserService,
        ICommissionOfferingRepository offeringRepository)
        : IRequestHandler<GetOfferingsQuery, IReadOnlyList<CommissionOfferingDto>> {
        public async Task<IReadOnlyList<CommissionOfferingDto>> Handle(GetOfferingsQuery request,
                                                                       CancellationToken cancellationToken) {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            IReadOnlyList<CommissionOffering> offerings;
            if (request.OnlyMyOfferings) {
                offerings = await offeringRepository.GetByArtistAsync(currentUserId, cancellationToken);
            }
            else {
                offerings = await offeringRepository.GetActiveAsync(cancellationToken);
            }

            var dtos = new List<CommissionOfferingDto>();
            foreach (CommissionOffering offering in offerings) {
                int activeCount = await offeringRepository.GetActiveRequestCountAsync(offering.Id, cancellationToken);
                dtos.Add(new CommissionOfferingDto(
                    offering.Id,
                    offering.Title,
                    offering.Description,
                    offering.BasePrice.Amount,
                    offering.BasePrice.Currency,
                    offering.MaxSlots,
                    activeCount,
                    offering.IsActive,
                    offering.CreatedAt,
                    new ArtistInfoDto(offering.Artist.Id, offering.Artist.DisplayName)));
            }

            return dtos;
        }
    }
}