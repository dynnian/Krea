namespace Krea.Application.Features.Commissions.DeactivateOffering {
    using Domain.Abstractions;

    public record DeactivateOfferingCommand(Guid OfferingId) : IRequest<Unit>;
}