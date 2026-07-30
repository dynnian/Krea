using Krea.Application.Abstractions.Payments;

namespace Krea.API.Tests.TestSupport {
    using Stripe;
    using System.Text.Json;

    public class TestStripePaymentGateway : IPaymentGateway {
        private readonly Dictionary<string, (decimal Amount, string Currency, string SuccessUrl, string CancelUrl)>
            _sessions = new();

        private string? _lastSessionId;

        public string? LastSessionId => _lastSessionId;

        public Task<CheckoutSessionResult> CreateCheckoutSessionAsync(
            decimal amount,
            string currency,
            string successUrl,
            string cancelUrl) {
            string sessionId = "cs_test_" + Guid.NewGuid().ToString("N");
            _lastSessionId = sessionId;
            _sessions[sessionId] = (amount, currency, successUrl, cancelUrl);
            return Task.FromResult(new CheckoutSessionResult(sessionId, $"https://checkout.stripe.com/{sessionId}"));
        }

        public StripeWebhookEvent ConstructStripeEvent(string json, string stripeSignature) {
            try {
                using JsonDocument doc = JsonDocument.Parse(json);
                string? type = doc.RootElement.GetProperty("type").GetString();
                string? sessionId = null;
                if (type == "checkout.session.completed") {
                    sessionId = doc.RootElement.GetProperty("data").GetProperty("object").GetProperty("id").GetString();
                }

                return new StripeWebhookEvent(type!, sessionId);
            }
            catch (Exception ex) when (ex is JsonException or KeyNotFoundException) {
                throw new StripeException("Invalid JSON payload");
            }
        }
    }
}