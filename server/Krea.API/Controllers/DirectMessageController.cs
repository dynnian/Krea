namespace Krea.API.Controllers;

using Application.Features.DirectMessages.Dto;
using Application.Features.DirectMessages.GetConversation;
using Application.Features.DirectMessages.MarkMessageAsRead;
using Application.Features.DirectMessages.SendDirectMessage;
using Domain.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DirectMessagesController(ISender sender) : ControllerBase {
    
    [HttpGet("{otherUserId}")]
    public async Task<ActionResult<ConversationDto>> GetConversation(
        Guid otherUserId, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20)
    {
        Guid userId = GetCurrentUserId();
        var query = new GetConversationQuery(userId, otherUserId, page, pageSize);
        ConversationDto result = await sender.Send(query);
        return Ok(result);
    }
    
    // Endpoint de prueba
    [HttpPost]
    public async Task<ActionResult<DirectMessageDto>> SendMessage([FromBody] SendDirectMessageCommand command)
    {

        Guid userId = GetCurrentUserId();
        if (command.SenderId != userId)
            return Unauthorized();

        DirectMessageDto result = await sender.Send(command);
        return CreatedAtAction(nameof(GetConversation), new { otherUserId = command.ReceiverId }, result);
    }

    [HttpPatch("{messageId}/read")]
    public async Task<IActionResult> MarkAsRead(Guid messageId)
    {
        Guid userId = GetCurrentUserId();
        var command = new MarkMessageAsReadCommand(messageId, userId);
        bool result = await sender.Send(command);
        if (!result)
            return NotFound();
        return Ok();
    }

    private Guid GetCurrentUserId()
    {
        string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}