namespace Krea.Application.Features.Commissions.GetOfferingDetails {
    using Domain.Abstractions;
    using Domain.Repositories;
    using Dtos;
    using Microsoft.Extensions.Logging;

    public class GetOfferingDetailsQueryHandler(
        ICommissionOfferingRepository offeringRepository,
        ILogger<GetOfferingDetailsQueryHandler> logger)
        : IRequestHandler<GetOfferingDetailsQuery, CommissionOfferingDto>
    {
        public async Task<CommissionOfferingDto> Handle(GetOfferingDetailsQuery request, CancellationToken cancellationToken)
        {
            var offering = await offeringRepository.GetByIdAsync(request.OfferingId, cancellationToken);
            if (offering == null)
                throw new Exception("Offering not found.");

            var activeCount = await offeringRepository.GetActiveRequestCountAsync(offering.Id, cancellationToken);
            return new CommissionOfferingDto(
                offering.Id,
                offering.Title,
                offering.Description,
                offering.BasePrice.Amount,
                offering.BasePrice.Currency,
                offering.MaxSlots,
                activeCount,
                offering.IsActive,
                offering.CreatedAt,
                new ArtistInfoDto(offering.Artist.Id, offering.Artist.DisplayName));
        }
    }
}