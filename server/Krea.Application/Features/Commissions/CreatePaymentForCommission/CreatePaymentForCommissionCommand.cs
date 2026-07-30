namespace Krea.Application.Features.Commissions.CreatePaymentForCommission {
    using Domain.Abstractions;

    public record CreatePaymentForCommissionCommand(
        Guid RequestId,
        decimal Amount,
        string Currency,
        string SuccessUrl,
        string CancelUrl
    ) : IRequest<CreatePaymentForCommissionResponse>;

    public record CreatePaymentForCommissionResponse(string CheckoutUrl);
}