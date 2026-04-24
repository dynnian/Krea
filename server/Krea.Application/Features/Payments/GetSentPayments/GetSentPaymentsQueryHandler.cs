using Krea.Application.Abstractions.Auth;
using Krea.Application.Abstractions.Payments;
using Krea.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace Krea.Application.Features.Payments.GetSentPayments;

using Dtos;

public class GetSentPaymentsQueryHandler(
    ICurrentUserService currentUserService,
    IPaymentReadService paymentReadService,
    ILogger<GetSentPaymentsQueryHandler> logger)
    : IRequestHandler<GetSentPaymentsQuery, PagedResult<PaymentSummaryDto>>
{
    public async Task<PagedResult<PaymentSummaryDto>> Handle(GetSentPaymentsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId == Guid.Empty)
            throw new UnauthorizedAccessException();

        var filter = new PaymentFilter(
            request.PaymentType,
            request.Status,
            request.From,
            request.To,
            request.Page,
            request.PageSize);

        return await paymentReadService.GetSentPaymentsAsync(userId, filter, cancellationToken);
    }
}