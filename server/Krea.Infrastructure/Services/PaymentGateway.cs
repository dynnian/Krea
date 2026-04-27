using Krea.Application.Abstractions.Payments;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace Krea.Infrastructure.Services
{
    public class StripePaymentGateway : IPaymentGateway
    {
        private readonly string _webhookSecret;

        public StripePaymentGateway(IOptions<StripeOptions> options)
        {
            string apiKey = options.Value.ApiKey;
            _webhookSecret = options.Value.WebhookSecret;
            StripeConfiguration.ApiKey = apiKey;
        }

        public async Task<CheckoutSessionResult> CreateCheckoutSessionAsync(
            decimal amount,
            string currency,
            string successUrl,
            string cancelUrl)
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = [
                    new SessionLineItemOptions {
                        PriceData = new SessionLineItemPriceDataOptions {
                            Currency = currency,
                            ProductData =
                                new SessionLineItemPriceDataProductDataOptions { Name = "Donation to Krea artist", },
                            UnitAmount = (long)(amount * 100),
                        },
                        Quantity = 1,
                    }

                ],
                Mode = "payment",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
            };

            var service = new SessionService();
            Session? session = await service.CreateAsync(options);
            
            return new CheckoutSessionResult(session.Id, session.Url);
        }

        public StripeWebhookEvent ConstructStripeEvent(string json, string stripeSignature)
        {
            Event? stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, _webhookSecret);

            string? sessionId = null;
            if (stripeEvent.Type != "checkout.session.completed")
                return new StripeWebhookEvent(stripeEvent.Type, sessionId);
            var session = stripeEvent.Data.Object as Session;
            sessionId = session?.Id;

            return new StripeWebhookEvent(stripeEvent.Type, sessionId);
        }
    }

    public class StripeOptions
    {
        public string ApiKey { get; set; } = string.Empty;
        public string WebhookSecret { get; set; } = string.Empty;
    }
}