namespace Krea.Application.Features.Commissions.CancelCommission {
    using Domain.Abstractions;

    public record CancelCommissionCommand(Guid RequestId) : IRequest<Unit>;
}