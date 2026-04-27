namespace Krea.API.Controllers {
    using Application.Abstractions.Notification;
    using Application.Features.Notifications.DeleteNotification;
    using Application.Features.Notifications.Dto;
    using Application.Features.Notifications.GetNotifications;
    using Application.Features.Notifications.GetPreferences;
    using Application.Features.Notifications.GetUnreadCount;
    using Application.Features.Notifications.MarkAllNotificationsAsRead;
    using Application.Features.Notifications.MarkNotificationAsRead;
    using Application.Features.Notifications.UpdateReferences;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Net.ServerSentEvents;
    using System.Runtime.CompilerServices;
    using System.Security.Claims;
    using System.Threading.Channels;

    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public sealed class NotificationsController : ControllerBase {
        private readonly ISender _sender;
        private readonly INotificationStream _stream;

        public NotificationsController(ISender sender, INotificationStream stream) {
            _sender = sender;
            _stream = stream;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetMyNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default) {
            Guid userId = GetCurrentUserId();

            IReadOnlyList<NotificationDto> result = await _sender.Send(
                new GetMyNotificationsQuery(userId, page, pageSize),
                ct);

            return Ok(result);
        }

        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount(CancellationToken ct = default) {
            Guid userId = GetCurrentUserId();

            int result = await _sender.Send(new GetUnreadCountQuery(userId), ct);
            return Ok(result);
        }

        [HttpPatch("{notificationId:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid notificationId, CancellationToken ct = default) {
            Guid userId = GetCurrentUserId();

            await _sender.Send(new MarkNotificationAsReadCommand(userId, notificationId), ct);
            return NoContent();
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead(CancellationToken ct = default) {
            Guid userId = GetCurrentUserId();

            await _sender.Send(new MarkAllNotificationsAsReadCommand(userId), ct);
            return NoContent();
        }

        [HttpDelete("{notificationId:guid}")]
        public async Task<IActionResult> Delete(Guid notificationId, CancellationToken ct = default) {
            Guid userId = GetCurrentUserId();

            await _sender.Send(new DeleteNotificationCommand(userId, notificationId), ct);
            return NoContent();
        }

        [HttpGet("preferences")]
        public async Task<ActionResult<NotificationPreferencesDto>> GetPreferences(CancellationToken ct = default) {
            Guid userId = GetCurrentUserId();

            NotificationPreferencesDto result = await _sender.Send(new GetNotificationPreferencesQuery(userId), ct);
            return Ok(result);
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferences(
            [FromBody] UpdateNotificationPreferencesRequest request,
            CancellationToken ct = default) {
            Guid userId = GetCurrentUserId();

            await _sender.Send(new UpdateNotificationPreferencesCommand(
                    userId,
                    request.AllNotificationsPaused,
                    request.Preferences),
                ct);

            return NoContent();
        }

        [HttpGet("stream")]
        public IResult Stream(CancellationToken ct) {
            Guid userId = GetCurrentUserId();
            ChannelReader<NotificationEventDto> reader = _stream.Subscribe(userId, ct);

            return TypedResults.ServerSentEvents(StreamEvents(reader, ct));
        }

        private static async IAsyncEnumerable<SseItem<NotificationEventDto>> StreamEvents(
            ChannelReader<NotificationEventDto> reader,
            [EnumeratorCancellation] CancellationToken ct) {
            await foreach (NotificationEventDto item in reader.ReadAllAsync(ct)) {
                yield return new SseItem<NotificationEventDto>(item, "notification");
            }
        }

        private Guid GetCurrentUserId() {
            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid userId))
                throw new UnauthorizedAccessException("User ID not found in claims.");

            return userId;
        }
    }
}