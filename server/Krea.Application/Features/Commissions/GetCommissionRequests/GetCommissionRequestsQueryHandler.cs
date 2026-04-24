namespace Krea.Application.Features.Commissions.GetCommissionRequests;

using Abstractions.Auth;
using Domain.Abstractions;
using Domain.Entities;
using Domain.Repositories;
using Dtos;
using Microsoft.Extensions.Logging;

public class GetCommissionRequestsQueryHandler(
    ICurrentUserService currentUserService,
    ICommissionRequestRepository requestRepository,
    ILogger<GetCommissionRequestsQueryHandler> logger)
    : IRequestHandler<GetCommissionRequestsQuery, IReadOnlyList<CommissionRequestDto>>
{
    public async Task<IReadOnlyList<CommissionRequestDto>> Handle(GetCommissionRequestsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId;
        if (currentUserId == Guid.Empty)
            throw new UnauthorizedAccessException();

        IReadOnlyList<CommissionRequest> requests;
        if (request.AsBidder)
        {
            requests = await requestRepository.GetByBidderAsync(currentUserId, cancellationToken);
        }
        else
        {
            requests = await requestRepository.GetByArtistAsync(currentUserId, cancellationToken);
        }

        return requests.Select(r => new CommissionRequestDto(
            r.Id,
            r.Brief,
            r.Status.ToString(),
            r.CreatedAt,
            r.UpdatedAt,
            new CommissionOfferingMinimalDto(r.Offering.Id, r.Offering.Title, r.Offering.BasePrice.Amount, r.Offering.BasePrice.Currency),
            new BidderInfoDto(r.Bidder.Id, r.Bidder.DisplayName),
            Array.Empty<PaymentInfoDto>(),
            Array.Empty<SubmissionDto>()
        )).ToList();
    }
}