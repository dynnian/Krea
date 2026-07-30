namespace Krea.Application.Features.Commissions.UpdateCommissionOffering {
    using Domain.Abstractions;

    public record UpdateCommissionOfferingCommand(
        Guid OfferingId,
        string Title,
        string? Description,
        decimal Amount,
        string Currency,
        int MaxSlots) : IRequest<Unit>;
}