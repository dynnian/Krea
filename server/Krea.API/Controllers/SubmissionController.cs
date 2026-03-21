namespace Krea.API.Controllers 
{
    using Application.Features.Commissions.AddSubmissionFeedback;
    using Application.Features.Commissions.EditSubmissionFeedback;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// Handles operations related to submission feedback, such as adding and editing feedback.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/submissions")]
    public class SubmissionController : ControllerBase
    {
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
        public async Task<IActionResult> AddFeedback(Guid submissionId, [FromBody] AddFeedbackRequest request)
        {
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
        public async Task<IActionResult> EditFeedback(Guid feedbackId, [FromBody] EditFeedbackRequest request)
        {
            var command = new EditSubmissionFeedbackCommand(feedbackId, request.NewContent);
            await _sender.Send(command);
            return NoContent();
        }
    }
}