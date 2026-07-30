namespace Krea.API.Controllers {
    using Application.Features.Commissions.AddSubmissionFeedback;
    using Application.Features.Commissions.Dtos;
    using Application.Features.Commissions.EditSubmissionFeedback;
    using Application.Features.Commissions.GetFeedback;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// Handles operations related to submission feedback, such as adding and editing feedback.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/submissions")]
    public class SubmissionController : ControllerBase {
        private readonly ISender _sender;

        /// <summary>
        /// Initializes a new instance of the <see cref="SubmissionController"/> class.
        /// </summary>
        /// <param name="sender">The mediator sender for dispatching commands.</param>
        public SubmissionController(ISender sender) => _sender = sender;

        /// <summary>
        /// Adds feedback to a submission.
        /// </summary>
        /// <param name="submissionId">The ID of the submission.</param>
        /// <param name="request">The feedback content.</param>
        /// <returns>No content on success.</returns>
        [HttpPost("{submissionId}/feedback")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddFeedback(Guid submissionId, [FromBody] AddFeedbackRequest request) {
            var command = new AddSubmissionFeedbackCommand(submissionId, request.Content);
            await _sender.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Edits an existing feedback.
        /// </summary>
        /// <param name="feedbackId">The ID of the feedback.</param>
        /// <param name="request">The updated content.</param>
        /// <returns>No content on success.</returns>
        [HttpPut("feedback/{feedbackId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> EditFeedback(Guid feedbackId, [FromBody] EditFeedbackRequest request) {
            var command = new EditSubmissionFeedbackCommand(feedbackId, request.NewContent);
            await _sender.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Retrieves all feedback entries for a specific submission.
        /// </summary>
        /// <param name="submissionId">The ID of the submission.</param>
        /// <returns>A list of feedback entries with author details and timestamps.</returns>
        /// <response code="200">Returns the feedback list.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="403">If the user is not authorized to view the feedback.</response>
        /// <response code="404">If the submission is not found.</response>
        [HttpGet("{submissionId}/feedback")]
        [ProducesResponseType(typeof(IReadOnlyList<SubmissionFeedbackDto>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<IReadOnlyList<SubmissionFeedbackDto>>> GetFeedback(Guid submissionId) {
            var query = new GetFeedbackQuery(submissionId);
            IReadOnlyList<SubmissionFeedbackDto> result = await _sender.Send(query);
            return Ok(result);
        }
    }
}