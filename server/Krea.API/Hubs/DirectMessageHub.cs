namespace Krea.API.Hubs;

using Application.Features.DirectMessages;
using Application.Features.DirectMessages.Dto;
using Application.Features.DirectMessages.SendDirectMessage;
using Domain.Abstractions;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

[Authorize]
public class DirectMessageHub(ISender sender, ILogger<DirectMessageHub> logger) : Hub {
    public override async Task OnConnectedAsync()
    {
        Guid? userId = GetCurrentUserId();
        if (userId.HasValue)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId.Value.ToString());
            logger.LogInformation("User {UserId} connected to DM hub", userId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Guid? userId = GetCurrentUserId();
        if (userId.HasValue)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.Value.ToString());
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(SendDirectMessageCommand command)
    {
        Guid? senderId = GetCurrentUserId();
        if (!senderId.HasValue)
        {
            await Clients.Caller.SendAsync("ErrorMessage", "User not authenticated");
            return;
        }
        
        // Check senderId coincides with authenticated user
        if (command.SenderId != senderId.Value)
        {
            await Clients.Caller.SendAsync("ErrorMessage", "Invalid sender ID");
            return;
        }

        try
        {
            DirectMessageDto messageDto = await sender.Send(command);
            
            // Send to receiver
            await Clients.Group(command.ReceiverId.ToString())
                .SendAsync("ReceiveMessage", messageDto);
            
            // Send to sender UI
            await Clients.Caller.SendAsync("ReceiveMessage", messageDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error sending message");
            await Clients.Caller.SendAsync("ErrorMessage", "Failed to send message");
        }
    }

    private Guid? GetCurrentUserId()
    {
        Claim? userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid userId))
            return userId;
        return null;
    }
}