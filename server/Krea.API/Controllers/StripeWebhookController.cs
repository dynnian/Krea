namespace Krea.API.Controllers {
    using Application.Abstractions.Payments;
    using Application.Features.Payments.ConfirmPayment;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Mvc;
    using Stripe;

    /// <summary>
    /// Handles incoming Stripe webhook events, such as payment confirmations.
    /// </summary>
    [ApiController]
    [Route("api/webhooks/stripe")]
    public class StripeWebhookController(
        IPaymentGateway paymentGateway,
        ISender sender,
        ILogger<StripeWebhookController> logger)
        : ControllerBase {
        /// <summary>
        /// Receives Stripe webhook events, verifies the signature, and processes relevant events.
        /// </summary>
        /// <returns>HTTP 200 if the event was handled (or ignored); otherwise 400 on verification failure.</returns>
        /// <remarks>
        /// This endpoint is publicly accessible (no authentication) but relies on Stripe's signature
        /// verification for security. Only <c>checkout.session.completed</c> events are processed.
        /// </remarks>
        [HttpPost]
        public async Task<IActionResult> HandleWebhook() {
            string json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            string? stripeSignature = Request.Headers["Stripe-Signature"];

            if (string.IsNullOrEmpty(stripeSignature)) {
                logger.LogWarning("Stripe-Signature header missing.");
                return BadRequest();
            }

            try {
                StripeWebhookEvent webhookEvent = paymentGateway.ConstructStripeEvent(json, stripeSignature);

                if (webhookEvent.Type != "checkout.session.completed" || webhookEvent.SessionId == null)
                    return Ok();
                var command = new ConfirmPaymentCommand("stripe", webhookEvent.SessionId);
                await sender.Send(command);

                return Ok();
            }
            catch (StripeException ex) {
                logger.LogError(ex, "Stripe webhook signature verification failed.");
                return BadRequest();
            }
        }
    }
}