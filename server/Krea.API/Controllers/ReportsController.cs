namespace Krea.API.Controllers {
    using Application.Features.Posts.UserReports;
    using Application.Features.User.GetReportsByUser;
    using Contracts;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    /// <summary>
    /// Controller responsible for managing user reports about posts within the platform.
    /// </summary>
    /// <remarks>
    /// This controller exposes endpoints to create and retrieve reports.
    /// 
    /// All endpoints require authentication.
    /// </remarks>
    [ApiController]
    [Authorize]
    [Route("api")]
    public sealed class ReportsController : ControllerBase {
        private readonly ISender _sender;

        /// <summary>
        /// Initializes a new instance of the <see cref="ReportsController"/> class.
        /// </summary>
        /// <param name="sender">
        /// Mediator used to dispatch application commands and queries.
        /// </param>
        public ReportsController(ISender sender) => _sender = sender;

        /// <summary>
        /// Creates a moderation report for a specific post.
        /// </summary>
        /// <remarks>
        /// <para>
        /// Allows an authenticated user to report a post for violating platform rules.
        /// </para>
        ///
        /// <para>
        /// The report includes a category (<c>Reason</c>) and optional additional details.
        /// Once created, the report is marked as <c>Pending</c> and will be reviewed by a moderator.
        /// </para>
        ///
        /// <para><b>Business Rules:</b></para>
        /// <list type="bullet">
        /// <item><description>The post must exist and must not be deleted.</description></item>
        /// <item><description>The user cannot report their own post.</description></item>
        /// <item><description>The user cannot create multiple pending reports for the same post.</description></item>
        /// <item><description>The <c>Reason</c> must be one of the allowed categories.</description></item>
        /// </list>
        ///
        /// <para><b>Allowed Reasons:</b></para>
        /// <list type="bullet">
        /// <item><description>Spam</description></item>
        /// <item><description>Harassment</description></item>
        /// <item><description>HateSpeech</description></item>
        /// <item><description>Nudity</description></item>
        /// <item><description>Violence</description></item>
        /// <item><description>Copyright</description></item>
        /// <item><description>Misinformation</description></item>
        /// <item><description>Other</description></item>
        /// </list>
        ///
        /// <para><b>Example Request:</b></para>
        /// <example>
        /// POST /api/posts/{postId}/reports
        /// {
        ///   "reason": "Spam",
        ///   "details": "This post is repetitive and looks like advertising."
        /// }
        /// </example>
        /// </remarks>
        /// <param name="postId">The unique identifier of the post to report.</param>
        /// <param name="request">The report data including reason and optional details.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>Returns the created report information including its identifier and status.</returns>
        /// <response code="200">Report created successfully.</response>
        /// <response code="400">Invalid request data or business rule violation.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="404">Post not found.</response>
        [HttpPost("posts/{postId:guid}/reports")]
        public async Task<IActionResult> Create(
            Guid postId,
            [FromBody] CreatePostModerationReportRequest request,
            CancellationToken ct) {
            Guid reporterUserId = GetCurrentUserId();

            var command = new CreatePostModerationReportCommand(
                postId,
                reporterUserId,
                request.Reason,
                request.Details
            );

            CreatePostModerationReportResponse response = await _sender.Send(command, ct);

            return Ok(response);
        }

        /// <summary>
        /// Gets the moderation reports created by the authenticated user.
        /// </summary>
        /// <remarks>
        /// <para>
        /// Returns a paginated list of reports submitted by the current authenticated user.
        /// </para>
        ///
        /// <para>
        /// Reports are ordered from newest to oldest.
        /// </para>
        ///
        /// <para>
        /// This endpoint is intended for the client side so users can review the reports they have submitted,
        /// including their current moderation status and any resolution information available.
        /// </para>
        ///
        /// <para><b>Returned Information:</b></para>
        /// <list type="bullet">
        /// <item><description>Report identifier.</description></item>
        /// <item><description>Reported post identifier.</description></item>
        /// <item><description>Reason and optional details.</description></item>
        /// <item><description>Current moderation status.</description></item>
        /// <item><description>Resolved action, if the report has already been reviewed.</description></item>
        /// <item><description>Moderator note, if available.</description></item>
        /// <item><description>Creation and update timestamps.</description></item>
        /// </list>
        ///
        /// <para><b>Example Request:</b></para>
        /// <example>
        /// GET /api/reports/me?page=1&amp;pageSize=20
        /// </example>
        /// </remarks>
        /// <param name="page">The page number to retrieve. Must be greater than zero.</param>
        /// <param name="pageSize">The number of items per page. Must be greater than zero.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>Returns the paginated list of moderation reports created by the current user.</returns>
        /// <response code="200">Reports retrieved successfully.</response>
        /// <response code="400">Invalid pagination parameters.</response>
        /// <response code="401">User is not authenticated.</response>
        [HttpGet("reports/me")]
        public async Task<IActionResult> GetMyReports(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default) {
            Guid reporterUserId = GetCurrentUserId();

            var query = new GetMyPostModerationReportsQuery(
                reporterUserId,
                page,
                pageSize
            );

            GetMyPostModerationReportsResponse response = await _sender.Send(query, ct);

            return Ok(response);
        }

        private Guid GetCurrentUserId() {
            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
                throw new UnauthorizedAccessException("User ID not found in claims.");

            return userId;
        }
    }
}