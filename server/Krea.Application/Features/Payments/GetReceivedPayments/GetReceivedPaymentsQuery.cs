using Krea.Application.Abstractions.Payments;
using Krea.Domain.Abstractions;

namespace Krea.Application.Features.Payments.GetReceivedPayments;

using Dtos;

public record GetReceivedPaymentsQuery(
    string? PaymentType = null,
    string? Status = null,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<PaymentSummaryDto>>;