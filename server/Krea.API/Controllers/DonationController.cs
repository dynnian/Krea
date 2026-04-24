namespace Krea.API.Controllers
{
    using Application.Features.Donations.CreateDonation;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// Handles operations related to donations, including creating a new donation and initiating the payment process.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DonationsController : ControllerBase
    {
        private readonly ISender _sender;

        /// <summary>
        /// Initializes a new instance of the <see cref="DonationsController"/> class.
        /// </summary>
        /// <param name="sender">The mediator sender for dispatching commands and queries.</param>
        public DonationsController(ISender sender)
        {
            _sender = sender;
        }

        /// <summary>
        /// Creates a new donation and initiates a Stripe Checkout session.
        /// </summary>
        /// <param name="request">The donation creation request containing recipient, amount, currency, and return URLs.</param>
        /// <returns>A response containing the donation ID and the Stripe Checkout URL.</returns>
        /// <response code="200">Returns the donation ID and checkout URL.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        [HttpPost]
        [ProducesResponseType(typeof(CreateDonationResponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<CreateDonationResponse>> CreateDonation(CreateDonationRequest request)
        {
            var command = new CreateDonationCommand(
                request.RecipientId,
                request.Amount,
                request.Currency,
                request.Message,
                request.SuccessUrl,
                request.CancelUrl
            );

            var result = await _sender.Send(command);
            return Ok(result);
        }
    }

    /// <summary>
    /// Represents the request payload for creating a donation.
    /// </summary>
    /// <param name="RecipientId">The unique identifier of the artist receiving the donation.</param>
    /// <param name="Amount">The monetary amount of the donation.</param>
    /// <param name="Currency">The three‑letter currency code (e.g., "USD").</param>
    /// <param name="Message">An optional message from the donor to the recipient.</param>
    /// <param name="SuccessUrl">The URL to redirect the user to after successful payment.</param>
    /// <param name="CancelUrl">The URL to redirect the user to if the payment is canceled.</param>
    public record CreateDonationRequest(
        Guid RecipientId,
        decimal Amount,
        string Currency,
        string? Message,
        string SuccessUrl,
        string CancelUrl
    );
}