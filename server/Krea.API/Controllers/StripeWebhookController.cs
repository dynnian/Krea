namespace Krea.API.Controllers {
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/webhooks/stripe")]
    [AllowAnonymous]
    public class StripeWebhookController : ControllerBase
    {
        private readonly ISender _sender;
        private readonly ILogger<StripeWebhookController> _logger;

        public StripeWebhookController(ISender sender, ILogger<StripeWebhookController> logger)
        {
            _sender = sender;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> HandleWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            // Add signature verification
            // Manually construct event for testing
            // In Prod use Stripe.EventUtility.

            // Placeholder: just log and return OK.
            _logger.LogInformation("Webhook received (body length: {Length})", json.Length);

            // When signature is implemented, deserialize into a Stripe.Event.
            // Parse with Stripe.EventUtility.ConstructEvent.

            return Ok();
        }
    }
}