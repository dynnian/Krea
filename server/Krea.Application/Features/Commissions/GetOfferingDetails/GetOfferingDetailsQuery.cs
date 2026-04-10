namespace Krea.Application.Features.Commissions.GetOfferingDetails {
    using Domain.Abstractions;
    using Dtos;

    public record GetOfferingDetailsQuery(Guid OfferingId) : IRequest<CommissionOfferingDto>;
}