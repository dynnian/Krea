namespace Krea.Application.Features.Commissions.GetCommissionRequests {
    using Domain.Abstractions;
    using Dtos;

    public record GetCommissionRequestsQuery(bool AsBidder) : IRequest<IReadOnlyList<CommissionRequestDto>>;
}