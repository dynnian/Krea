namespace Krea.API.Controllers
{
    using Application.Features.Commissions.CreateCommissionOffering;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// Handles operations related to commission offerings created by artists.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/commission-offerings")]
    public class CommissionOfferingController : ControllerBase
    {
        private readonly ISender _sender;

        /// <summary>
        /// Initializes a new instance of the <see cref="CommissionOfferingController"/> class.
        /// </summary>
        /// <param name="sender">The mediator sender for dispatching commands.</param>
        public CommissionOfferingController(ISender sender)
        {
            _sender = sender;
        }

        /// <summary>
        /// Creates a new commission offering for the authenticated artist.
        /// </summary>
        /// <param name="request">The commission offering details.</param>
        /// <returns>The ID of the newly created offering.</returns>
        /// <response code="200">Returns the offering ID.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        [HttpPost]
        [ProducesResponseType(typeof(CreateCommissionOfferingResponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<CreateCommissionOfferingResponse>> CreateCommissionOffering(CreateCommissionOfferingRequest request)
        {
            var command = new CreateCommissionOfferingCommand(
                request.Title,
                request.Description,
                request.Amount,
                request.Currency,
                request.MaxSlots);

            var result = await _sender.Send(command);
            return Ok(result);
        }

        // Add endpoints for listing, activating, deactivating.
    }

    /// <summary>
    /// Request payload for creating a commission offering.
    /// </summary>
    /// <param name="Title">The title of the offering.</param>
    /// <param name="Description">Optional description.</param>
    /// <param name="Amount">The base price amount.</param>
    /// <param name="Currency">The three‑letter currency code (e.g., "USD").</param>
    /// <param name="MaxSlots">Maximum number of concurrent commissions.</param>
    public record CreateCommissionOfferingRequest(
        string Title,
        string? Description,
        decimal Amount,
        string Currency,
        int MaxSlots);
}