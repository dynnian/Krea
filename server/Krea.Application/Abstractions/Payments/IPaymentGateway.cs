namespace Krea.Application.Abstractions.Payments {
    public interface IPaymentGateway {
        Task<CheckoutSessionResult> CreateCheckoutSessionAsync(
            decimal amount,
            string currency,
            string successUrl,
            string cancelUrl);

        StripeWebhookEvent ConstructStripeEvent(string json, string stripeSignature);
    }

    public record CheckoutSessionResult(string SessionId, string Url);

    public record StripeWebhookEvent(string Type, string? SessionId);
}