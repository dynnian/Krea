namespace Krea.API.Hubs {
    using Application.Features.DirectMessages.Dto;
    using Application.Features.DirectMessages.SendDirectMessage;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.SignalR;
    using System.Security.Claims;

    /// <summary>
    /// SignalR hub for real-time direct messaging between users.
    /// Requires authentication; each user is added to a group named with their user ID.
    /// </summary>
    [Authorize]
    public class DirectMessageHub(ISender sender, ILogger<DirectMessageHub> logger) : Hub {
        /// <summary>
        /// Called when a client connects to the hub.
        /// Adds the connection to a group named with the user's ID for targeted messages.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task OnConnectedAsync() {
            Guid? userId = GetCurrentUserId();
            if (userId.HasValue) {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId.Value.ToString());
                logger.LogInformation("User {UserId} connected to DM hub", userId);
            }

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Called when a client disconnects from the hub.
        /// Removes the connection from the user's group.
        /// </summary>
        /// <param name="exception">The exception that caused the disconnection, if any.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task OnDisconnectedAsync(Exception? exception) {
            Guid? userId = GetCurrentUserId();
            if (userId.HasValue) {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.Value.ToString());
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Sends a direct message to another user.
        /// The message is persisted and then delivered in real-time to both the sender and the receiver.
        /// </summary>
        /// <param name="command">The command containing sender ID, receiver ID, and message content.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        /// <remarks>
        /// The client will receive one of the following messages:
        /// - "ReceiveMessage" with the <see cref="DirectMessageDto"/> when the message is successfully sent.
        /// - "ErrorMessage" with a string describing the error if the operation fails.
        /// </remarks>
        public async Task SendMessage(SendDirectMessageCommand command) {
            Guid? senderId = GetCurrentUserId();
            if (!senderId.HasValue) {
                await Clients.Caller.SendAsync("ErrorMessage", "User not authenticated");
                return;
            }

            // Check senderId coincides with authenticated user
            if (command.SenderId != senderId.Value) {
                await Clients.Caller.SendAsync("ErrorMessage", "Invalid sender ID");
                return;
            }

            try {
                DirectMessageDto messageDto = await sender.Send(command);

                // Send to receiver
                await Clients.Group(command.ReceiverId.ToString())
                             .SendAsync("ReceiveMessage", messageDto);

                // Send to sender UI
                await Clients.Caller.SendAsync("ReceiveMessage", messageDto);
            }
            catch (Exception ex) {
                logger.LogError(ex, "Error sending message");
                await Clients.Caller.SendAsync("ErrorMessage", "Failed to send message");
            }
        }

        /// <summary>
        /// Extracts the current user's ID from the claims principal.
        /// </summary>
        /// <returns>The user's ID as a Guid, or null if not authenticated.</returns>
        private Guid? GetCurrentUserId() {
            Claim? userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid userId))
                return userId;
            return null;
        }
    }
}