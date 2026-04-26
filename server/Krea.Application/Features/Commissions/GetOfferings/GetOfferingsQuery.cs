namespace Krea.Application.Features.Commissions.GetOfferings {
    using Domain.Abstractions;
    using Dtos;

    public record GetOfferingsQuery(bool OnlyMyOfferings) : IRequest<IReadOnlyList<CommissionOfferingDto>>;
}