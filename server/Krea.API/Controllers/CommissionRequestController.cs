namespace Krea.API.Controllers {
    using Application.Features.Commissions.AcceptCommissionRequest;
    using Application.Features.Commissions.AddSubmission;
    using Application.Features.Commissions.ApproveCommission;
    using Application.Features.Commissions.CancelCommission;
    using Application.Features.Commissions.CreateCommissionRequest;
    using Application.Features.Commissions.CreatePaymentForCommission;
    using Application.Features.Commissions.DeliverCommission;
    using Application.Features.Commissions.Dtos;
    using Application.Features.Commissions.GetCommissionRequests;
    using Application.Features.Commissions.GetRequestDetails;
    using Application.Features.Commissions.GetSubmissions;
    using Application.Features.Commissions.RequestChanges;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// Handles operations related to commission requests between bidders and artists.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/commission-requests")]
    public class CommissionRequestController : ControllerBase {
        private readonly ISender _sender;

        /// <summary>
        /// Initializes a new instance of the <see cref="CommissionRequestController"/> class.
        /// </summary>
        /// <param name="sender">The mediator sender for dispatching commands.</param>
        public CommissionRequestController(ISender sender) => _sender = sender;

        /// <summary>
        /// Creates a new commission request for a specific offering.
        /// </summary>
        /// <param name="request">The request details.</param>
        /// <returns>The ID of the newly created request.</returns>
        /// <response code="200">Returns the request ID.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        [HttpPost]
        [ProducesResponseType(typeof(CreateCommissionRequestResponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<CreateCommissionRequestResponse>> CreateCommissionRequest(
            CreateCommissionRequestRequest request) {
            var command = new CreateCommissionRequestCommand(request.OfferingId, request.Brief);
            CreateCommissionRequestResponse result = await _sender.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Accepts a pending commission request (artist only).
        /// </summary>
        /// <param name="requestId">The ID of the commission request.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If accepted successfully.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the artist.</response>
        /// <response code="404">If the request is not found.</response>
        [HttpPatch("{requestId}/accept")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Accept(Guid requestId) {
            var command = new AcceptCommissionRequestCommand(requestId);
            await _sender.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Initiates a payment for a commission request (bidder only).
        /// </summary>
        /// <param name="requestId">The ID of the commission request.</param>
        /// <param name="request">The payment details.</param>
        /// <returns>The Stripe checkout URL.</returns>
        /// <response code="200">Returns the checkout URL.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the bidder.</response>
        /// <response code="404">If the request is not found.</response>
        [HttpPost("{requestId}/payments")]
        [ProducesResponseType(typeof(CreatePaymentForCommissionResponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<CreatePaymentForCommissionResponse>> CreatePayment(
            Guid requestId,
            CreatePaymentForCommissionRequest request) {
            var command = new CreatePaymentForCommissionCommand(
                requestId,
                request.Amount,
                request.Currency,
                request.SuccessUrl,
                request.CancelUrl);
            CreatePaymentForCommissionResponse result = await _sender.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Adds a submission (media) to a commission request (artist only).
        /// </summary>
        /// <param name="requestId">The ID of the commission request.</param>
        /// <param name="request">The media ID to add as a submission.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If added successfully.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the artist.</response>
        /// <response code="404">If the request or media is not found.</response>
        [HttpPost("{requestId}/submissions")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> AddSubmission(Guid requestId, AddSubmissionRequest request) {
            var command = new AddSubmissionCommand(requestId, request.MediaId);
            await _sender.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Marks a commission as delivered (artist only).
        /// </summary>
        /// <param name="requestId">The ID of the commission request.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If delivered successfully.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the artist.</response>
        /// <response code="404">If the request is not found.</response>
        [HttpPatch("{requestId}/deliver")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deliver(Guid requestId) {
            var command = new DeliverCommissionCommand(requestId);
            await _sender.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Approves a delivered commission (bidder only).
        /// </summary>
        /// <param name="requestId">The ID of the commission request.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If approved successfully.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the bidder.</response>
        /// <response code="404">If the request is not found.</response>
        [HttpPatch("{requestId}/approve")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Approve(Guid requestId) {
            var command = new ApproveCommissionCommand(requestId);
            await _sender.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Requests changes to a delivered commission (bidder only).
        /// </summary>
        /// <param name="requestId">The ID of the commission request.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If request sent successfully.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not the bidder.</response>
        /// <response code="404">If the request is not found.</response>
        [HttpPatch("{requestId}/request-changes")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> RequestChanges(Guid requestId) {
            var command = new RequestChangesCommand(requestId);
            await _sender.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Cancels a commission request (either the bidder or artist under certain conditions).
        /// </summary>
        /// <param name="requestId">The ID of the commission request.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">If canceled successfully.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not authorized.</response>
        /// <response code="404">If the request is not found.</response>
        [HttpPatch("{requestId}/cancel")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Cancel(Guid requestId) {
            var command = new CancelCommissionCommand(requestId);
            await _sender.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Retrieves a list of commission requests for the authenticated user.
        /// </summary>
        /// <param name="asBidder">If true, returns requests where the user is the bidder; if false, returns requests for offerings owned by the user (artist).</param>
        /// <returns>A list of commission requests.</returns>
        /// <response code="200">Returns the list of requests.</response>
        /// <response code="401">If the user is not authenticated.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IReadOnlyList<CommissionRequestDto>), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<IReadOnlyList<CommissionRequestDto>>> GetRequests(
            [FromQuery] bool asBidder = true) {
            var query = new GetCommissionRequestsQuery(asBidder);
            IReadOnlyList<CommissionRequestDto> result = await _sender.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves detailed information about a specific commission request.
        /// </summary>
        /// <param name="requestId">The ID of the commission request.</param>
        /// <returns>The request details including payments, submissions, and feedback.</returns>
        /// <response code="200">Returns the request details.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is neither bidder nor artist.</response>
        /// <response code="404">If the request is not found.</response>
        [HttpGet("{requestId}")]
        [ProducesResponseType(typeof(CommissionRequestDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<CommissionRequestDto>> GetRequest(Guid requestId) {
            var query = new GetRequestDetailsQuery(requestId);
            CommissionRequestDto result = await _sender.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves paginated submissions for a commission request.
        /// </summary>
        /// <param name="requestId">The ID of the commission request.</param>
        /// <param name="page">Page number (starting from 1).</param>
        /// <param name="pageSize">Number of items per page.</param>
        /// <returns>A paginated list of submissions.</returns>
        /// <response code="200">Returns the submissions.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is neither bidder nor artist.</response>
        /// <response code="404">If the request is not found.</response>
        [HttpGet("{requestId}/submissions")]
        [ProducesResponseType(typeof(PagedResult<SubmissionDto>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<PagedResult<SubmissionDto>>> GetSubmissions(
            Guid requestId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) {
            var query = new GetSubmissionsQuery(requestId, page, pageSize);
            PagedResult<SubmissionDto> result = await _sender.Send(query);
            return Ok(result);
        }
    }


    /// <summary>
    /// Request payload for creating a commission request.
    /// </summary>
    /// <param name="OfferingId">The ID of the offering to request.</param>
    /// <param name="Brief">A description of the requested work.</param>
    public record CreateCommissionRequestRequest(Guid OfferingId, string Brief);

    /// <summary>
    /// Request payload for initiating a payment for a commission.
    /// </summary>
    /// <param name="Amount">The amount to pay (can be >= base price).</param>
    /// <param name="Currency">The three‑letter currency code.</param>
    /// <param name="SuccessUrl">URL to redirect after successful payment.</param>
    /// <param name="CancelUrl">URL to redirect if payment is cancelled.</param>
    public record CreatePaymentForCommissionRequest(
        decimal Amount,
        string Currency,
        string SuccessUrl,
        string CancelUrl);

    /// <summary>
    /// Request payload for adding a submission.
    /// </summary>
    /// <param name="MediaId">The ID of the media to attach.</param>
    public record AddSubmissionRequest(Guid MediaId);
}