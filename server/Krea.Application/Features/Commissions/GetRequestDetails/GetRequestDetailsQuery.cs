namespace Krea.Application.Features.Commissions.GetRequestDetails {
    using Domain.Abstractions;
    using Dtos;

    public record GetRequestDetailsQuery(Guid RequestId) : IRequest<CommissionRequestDto>;
}