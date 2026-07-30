namespace Krea.Application.Features.Commissions.DeliverCommission {
    using Domain.Abstractions;

    public record DeliverCommissionCommand(Guid RequestId) : IRequest<Unit>;
}