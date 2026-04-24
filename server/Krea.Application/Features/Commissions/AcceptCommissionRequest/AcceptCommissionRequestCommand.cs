namespace Krea.Application.Features.Commissions.AcceptCommissionRequest {
    using Domain.Abstractions;

    public record AcceptCommissionRequestCommand(Guid RequestId) : IRequest<Unit>;
}