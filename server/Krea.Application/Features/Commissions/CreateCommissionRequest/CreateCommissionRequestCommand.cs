namespace Krea.Application.Features.Commissions.CreateCommissionRequest {
    using Domain.Abstractions;

    public record CreateCommissionRequestCommand(
        Guid OfferingId,
        string Brief
    ) : IRequest<CreateCommissionRequestResponse>;

    public record CreateCommissionRequestResponse(Guid RequestId);
}