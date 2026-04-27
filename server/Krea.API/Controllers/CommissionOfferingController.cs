namespace Krea.API.Controllers {
    using Application.Features.Commissions.ActivateOffering;
    using Application.Features.Commissions.CreateCommissionOffering;
    using Application.Features.Commissions.DeactivateOffering;
    using Application.Features.Commissions.DeleteOffering;
    using Application.Features.Commissions.Dtos;
    using Application.Features.Commissions.GetOfferingDetails;
    using Application.Features.Commissions.GetOfferings;
    using Application.Features.Commissions.UpdateCommissionOffering;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// Handles operations related to commission offerings created by artists.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/commission-offerings")]
    public class CommissionOfferingController : ControllerBase {
        private readonly ISender _sender;

        /// <summary>
        /// Initializes a new instance of the <see cref="CommissionOfferingController"/> class.
        /// </summary>
        /// <param name="sender">The mediator sender for dispatching commands.</param>
        public CommissionOfferingController(ISender sender) => _sender = sender;

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
        public async Task<ActionResult<CreateCommissionOfferingResponse>> CreateCommissionOffering(
            CreateCommissionOfferingRequest request) {
            var command = new CreateCommissionOfferingCommand(
                request.Title,
                request.Description,
                request.Amount,
                request.Currency,
                request.MaxSlots);

            CreateCommissionOfferingResponse result = await _sender.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves a list of commission offerings.
        /// </summary>
        /// <param name="myOfferings">If true, returns only offerings created by the authenticated artist; otherwise returns all active offerings.</param>
        /// <returns>A list of commission offerings.</returns>
        /// <response code="200">Returns the list of offerings.</response>
        /// <response code="401">If the user is not authenticated.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IReadOnlyList<CommissionOfferingDto>), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<IReadOnlyList<CommissionOfferingDto>>> GetOfferings(
            [FromQuery] bool myOfferings = false) {
            var query = new GetOfferingsQuery(myOfferings);
            IReadOnlyList<CommissionOfferingDto> result = await _sender.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves details of a specific commission offering.
        /// </summary>
        /// <param name="offeringId">The ID of the offering.</param>
        /// <returns>The offering details including current active request count.</returns>
        /// <response code="200">Returns the offering details.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="404">If the offering is not found.</response>
        [HttpGet("{offeringId}")]
        [ProducesResponseType(typeof(CommissionOfferingDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<CommissionOfferingDto>> GetOffering(Guid offeringId) {
            var query = new GetOfferingDetailsQuery(offeringId);
            CommissionOfferingDto result = await _sender.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Updates an existing commission offering (artist only).
        /// </summary>
        /// <param name="offeringId">The ID of the offering.</param>
        /// <param name="request">The updated offering details.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If updated successfully.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the artist.</response>
        /// <response code="404">If the offering is not found.</response>
        [HttpPut("{offeringId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateOffering(Guid offeringId, UpdateCommissionOfferingRequest request) {
            var command = new UpdateCommissionOfferingCommand(offeringId, request.Title, request.Description,
                request.Amount, request.Currency, request.MaxSlots);
            await _sender.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Activates a commission offering (artist only).
        /// </summary>
        /// <param name="offeringId">The ID of the offering.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If activated successfully.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the artist.</response>
        /// <response code="404">If the offering is not found.</response>
        [HttpPatch("{offeringId}/activate")]
        [ProducesResponseType(204)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Activate(Guid offeringId) {
            await _sender.Send(new ActivateOfferingCommand(offeringId));
            return NoContent();
        }

        /// <summary>
        /// Deactivates a commission offering (artist only).
        /// </summary>
        /// <param name="offeringId">The ID of the offering.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If deactivated successfully.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the artist.</response>
        /// <response code="404">If the offering is not found.</response>
        [HttpPatch("{offeringId}/deactivate")]
        [ProducesResponseType(204)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deactivate(Guid offeringId) {
            await _sender.Send(new DeactivateOfferingCommand(offeringId));
            return NoContent();
        }

        /// <summary>
        /// Deletes a commission offering (artist only). Only allowed if there are no active or pending requests.
        /// </summary>
        /// <param name="offeringId">The ID of the offering.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If deleted successfully.</response>
        /// <response code="400">If the offering has active requests.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the artist.</response>
        /// <response code="404">If the offering is not found.</response>
        [HttpDelete("{offeringId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteOffering(Guid offeringId) {
            await _sender.Send(new DeleteOfferingCommand(offeringId));
            return NoContent();
        }
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

    /// <summary>
    /// Request payload for updating a commission offering.
    /// </summary>
    /// <param name="Title">The title of the offering.</param>
    /// <param name="Description">Optional description.</param>
    /// <param name="Amount">The base price amount.</param>
    /// <param name="Currency">The three‑letter currency code (e.g., "USD").</param>
    /// <param name="MaxSlots">Maximum number of concurrent commissions.</param>
    public record UpdateCommissionOfferingRequest(
        string Title,
        string? Description,
        decimal Amount,
        string Currency,
        int MaxSlots);
}