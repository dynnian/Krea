namespace Krea.Application.Features.Commissions.DeleteOffering {
    using Domain.Abstractions;

    public record DeleteOfferingCommand(Guid OfferingId) : IRequest<Unit>;
}