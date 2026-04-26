namespace Krea.Application.Features.Commissions.CreateCommissionOffering {
    using Domain.Abstractions;

    public record CreateCommissionOfferingCommand(
        string Title,
        string? Description,
        decimal Amount,
        string Currency,
        int MaxSlots
    ) : IRequest<CreateCommissionOfferingResponse>;

    public record CreateCommissionOfferingResponse(Guid OfferingId);
}