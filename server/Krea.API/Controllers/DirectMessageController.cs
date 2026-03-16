namespace Krea.API.Controllers {
    using Application.Features.DirectMessages.Dto;
    using Application.Features.DirectMessages.GetConversation;
    using Application.Features.DirectMessages.GetConversationMessages;
    using Application.Features.DirectMessages.GetUserConversations;
    using Application.Features.DirectMessages.MarkMessageAsRead;
    using Application.Features.DirectMessages.SendDirectMessage;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    /// <summary>
    /// Provides endpoints for managing direct messages and conversations
    /// between authenticated users.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DirectMessagesController(ISender sender) : ControllerBase {
        
        /// <summary>
        /// Retrieves all conversations for the authenticated user.
        /// </summary>
        /// <returns>
        /// Returns an OK response with a list of conversations, each containing the other participant's details,
        /// the last message (for preview), and unread count.
        /// </returns>
        [HttpGet("conversations")]
        public async Task<ActionResult<List<ConversationPreviewDto>>> GetConversations()
        {
            var userId = GetCurrentUserId();
            var query = new GetUserConversationsQuery(userId);
            var result = await sender.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves messages for a specific conversation.
        /// </summary>
        /// <param name="conversationId">The ID of the conversation.</param>
        /// <param name="page">Page number for pagination (default: 1).</param>
        /// <param name="pageSize">Number of messages per page (default: 20).</param>
        /// <returns>
        /// Returns an OK response with a paginated list of messages for the conversation.
        /// If the conversation does not exist or the user is not a participant, returns an empty list.
        /// </returns>
        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<ActionResult<List<DirectMessageDto>>> GetConversationMessages(
            Guid conversationId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            var query = new GetConversationMessagesQuery(userId, conversationId, page, pageSize);
            var result = await sender.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Gets the conversation between the authenticated user and another user.
        /// </summary>
        /// <param name="otherUserId">The ID of the other user.</param>
        /// <param name="page">Page number for pagination (default: 1).</param>
        /// <param name="pageSize">Number of messages per page (default: 20).</param>
        /// <returns>
        /// Returns an OK response with the conversation details and messages.
        /// </returns>
        [HttpGet("{otherUserId}")]
        public async Task<ActionResult<ConversationDto>> GetConversation(
            Guid otherUserId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            var query = new GetConversationQuery(userId, otherUserId, page, pageSize);
            var result = await sender.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Sends a direct message to another user. This endpoint is for testing; real-time messaging uses SignalR.
        /// </summary>
        /// <param name="command">The message command containing sender, receiver, and content.</param>
        /// <returns>
        /// Returns a CreatedAtAction response with the sent message details.
        /// Returns Unauthorized if the sender ID does not match the authenticated user.
        /// </returns>
        [HttpPost]
        public async Task<ActionResult<DirectMessageDto>> SendMessage([FromBody] SendDirectMessageCommand command)
        {
            var userId = GetCurrentUserId();
            if (command.SenderId != userId)
                return Unauthorized();

            var result = await sender.Send(command);
            return CreatedAtAction(nameof(GetConversation), new { otherUserId = command.ReceiverId }, result);
        }

        /// <summary>
        /// Marks a message as read by the authenticated user.
        /// </summary>
        /// <param name="messageId">The ID of the message to mark as read.</param>
        /// <returns>
        /// Returns OK if the message was marked as read successfully.
        /// Returns NotFound if the message does not exist or the user is not a participant.
        /// </returns>
        [HttpPatch("{messageId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid messageId)
        {
            var userId = GetCurrentUserId();
            var command = new MarkMessageAsReadCommand(messageId, userId);
            var result = await sender.Send(command);
            if (!result)
                return NotFound();
            return Ok();
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.Parse(userIdClaim!);
        }
    }
}