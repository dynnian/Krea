namespace Krea.Application.Features.Payments.ConfirmPayment {
    using Domain.Abstractions;

    public record ConfirmPaymentCommand(string Provider, string ExternalId) : IRequest<Unit>;
}