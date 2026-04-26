namespace Krea.Application.Features.Commissions.ActivateOffering {
    using Domain.Abstractions;

    public record ActivateOfferingCommand(Guid OfferingId) : IRequest<Unit>;
}