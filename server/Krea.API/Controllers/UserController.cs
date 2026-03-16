namespace Krea.API.Controllers {
    using Application.Features.User;
    using Application.Features.Follows;
    using Contracts;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    [ApiController]
    [Authorize]
    [Route("api/users")]
    public sealed class UsersController : ControllerBase {
        private readonly ISender _sender;

        public UsersController(ISender sender) => _sender = sender;

        [HttpPost("{targetId:guid}/follow")]
        public async Task<IActionResult> Follow(
            Guid targetId,
            CancellationToken cancellationToken) {
            await _sender.Send(
                new FollowUserCommand(GetCurrentUserId(), targetId),
                cancellationToken);

            return NoContent();
        }

        [HttpDelete("{targetId:guid}/unfollow")]
        public async Task<IActionResult> Unfollow(
            Guid targetId,
            CancellationToken cancellationToken) {
            await _sender.Send(
                new UnfollowUserCommand(GetCurrentUserId(), targetId),
                cancellationToken);

            return NoContent();
        }

        [HttpGet("me/profile")]
        public async Task<ActionResult<UserDto>> GetMyProfile(CancellationToken cancellationToken) {
            UserDto? profile = await _sender.Send(
                new GetUserProfileQuery(GetCurrentUserId()),
                cancellationToken);

            if (profile is null)
                return NotFound();

            return Ok(profile);
        }

        [AllowAnonymous]
        [HttpGet("{userId:guid}/profile")]
        public async Task<ActionResult<PublicUserProfileResponse>> GetPublicProfile(
            Guid userId,
            CancellationToken cancellationToken) {
            UserDto? profile = await _sender.Send(new GetUserProfileQuery(userId), cancellationToken);
            if (profile is null)
                return NotFound();

            return Ok(new PublicUserProfileResponse(
                profile.Id,
                profile.Username,
                profile.DisplayName,
                profile.Biography,
                profile.LanguageCode,
                profile.TimeZoneId));
        }

        [HttpPatch("me/profile")]
        public async Task<ActionResult<UserDto>> PatchMyProfile(
            [FromBody] PatchUserProfileRequest request,
            CancellationToken cancellationToken) {
            try {
                UserDto profile = await _sender.Send(
                    new UpdateUserProfileCommand(
                        GetCurrentUserId(),
                        request.DisplayName,
                        request.DisplayNameIsSet,
                        request.Biography,
                        request.BiographyIsSet,
                        request.LanguageCode,
                        request.LanguageCodeIsSet,
                        request.TimeZoneId,
                        request.TimeZoneIdIsSet,
                        request.ProfilePictureId,
                        request.ProfilePictureIdIsSet,
                        request.BannerPictureId,
                        request.BannerPictureIdIsSet),
                    cancellationToken);

                return Ok(profile);
            }
            catch (ArgumentException ex) {
                return BadRequest(new { error = ex.Message });
            }
            catch (KeyNotFoundException ex) {
                return NotFound(new { error = ex.Message });
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