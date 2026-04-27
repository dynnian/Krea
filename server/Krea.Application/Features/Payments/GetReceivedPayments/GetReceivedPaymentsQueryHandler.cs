using Krea.Application.Abstractions.Auth;
using Krea.Application.Abstractions.Payments;
using Krea.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace Krea.Application.Features.Payments.GetReceivedPayments {
    using Dtos;

    public class GetReceivedPaymentsQueryHandler(
        ICurrentUserService currentUserService,
        IPaymentReadService paymentReadService)
        : IRequestHandler<GetReceivedPaymentsQuery, PagedResult<PaymentSummaryDto>> {
        public async Task<PagedResult<PaymentSummaryDto>> Handle(GetReceivedPaymentsQuery request,
                                                                 CancellationToken cancellationToken) {
            Guid userId = currentUserService.UserId;
            if (userId == Guid.Empty)
                throw new UnauthorizedAccessException();

            var filter = new PaymentFilter(
                request.PaymentType,
                request.Status,
                request.From,
                request.To,
                request.Page,
                request.PageSize);

            return await paymentReadService.GetReceivedPaymentsAsync(userId, filter, cancellationToken);
        }
    }
}