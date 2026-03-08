namespace Krea.API.Controllers {
    using Application.Features.Follows;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/users")]
    public sealed class UsersController : ControllerBase
    {
        private readonly ISender _sender;

        public UsersController(ISender sender)
        {
            _sender = sender;
        }

        [HttpPost("{targetId:guid}/follow")]
        public async Task<IActionResult> Follow(
            Guid targetId,
            [FromBody] FollowUserCommand command,
            CancellationToken cancellationToken)
        {
            await _sender.Send(
                command with { TargetId = targetId },
                cancellationToken);

            return NoContent();
        }

        [HttpDelete("{targetId:guid}/unfollow")]
        public async Task<IActionResult> Unfollow(
            Guid targetId,
            [FromBody] UnfollowUserCommand command,
            CancellationToken cancellationToken)
        {
            await _sender.Send(
                command with { TargetId = targetId },
                cancellationToken);

            return NoContent();
        }
    }
}