namespace Krea.API.Controllers {
    using Application.Features.User;
    using Application.Features.Follows;
    using Application.Features.User.SearchUser;
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

        /// <summary>
        /// Gets the profile information of the currently authenticated user.
        /// </summary>
        /// <remarks>
        /// Returns the complete profile data for the authenticated user, including:
        /// <list type="bullet">
        /// <item><description>Username and email</description></item>
        /// <item><description>Display name and biography</description></item>
        /// <item><description>Language and time zone preferences</description></item>
        /// <item><description>User role identifier</description></item>
        /// <item><description>Followers count</description></item>
        /// <item><description>Following count</description></item>
        /// <item><description>Profile picture URL</description></item>
        /// <item><description>Banner picture URL</description></item>
        /// </list>
        /// This endpoint is intended for the owner of the profile.
        /// </remarks>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Returns the authenticated user's profile information.</returns>
        /// <response code="200">The profile was retrieved successfully.</response>
        /// <response code="401">The request is unauthorized.</response>
        /// <response code="404">The profile could not be found.</response>
        [HttpGet("me/profile")]
        public async Task<ActionResult<UserProfileDto>> GetMyProfile(
            CancellationToken cancellationToken)
        {
            var profile = await _sender.Send(
                new GetUserProfileQuery(GetCurrentUserId()),
                cancellationToken);

            if (profile is null)
                return NotFound();

            return Ok(profile);
        }

        /// <summary>
        /// Gets the public profile information of a specific user.
        /// </summary>
        /// <remarks>
        /// Returns the public profile data of the requested user, including:
        /// <list type="bullet">
        /// <item><description>Username</description></item>
        /// <item><description>Display name</description></item>
        /// <item><description>Biography</description></item>
        /// <item><description>Language code</description></item>
        /// <item><description>Time zone identifier</description></item>
        /// <item><description>Followers count</description></item>
        /// <item><description>Following count</description></item>
        /// <item><description>Profile picture URL</description></item>
        /// </list>
        /// This endpoint is publicly accessible and only exposes information intended
        /// to be visible to other users or anonymous visitors.
        /// </remarks>
        /// <param name="userId">The unique identifier of the user whose public profile will be retrieved.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Returns the public profile information of the specified user.</returns>
        /// <response code="200">The public profile was retrieved successfully.</response>
        /// <response code="404">The specified user profile could not be found.</response>
        [AllowAnonymous]
        [HttpGet("{userId:guid}/profile")]
        public async Task<ActionResult<PublicUserProfileResponse>> GetPublicProfile(
            Guid userId,
            CancellationToken cancellationToken)
        {
            PublicUserProfileResponse? profile = await _sender.Send(
                new GetPublicUserProfileQuery(userId),
                cancellationToken);

            if (profile is null)
                return NotFound();

            return Ok(profile);
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
        
        /// <summary>
        /// Gets the list of followers of the currently authenticated user.
        /// </summary>
        /// <remarks>
        /// Returns a paginated list of users who follow the currently authenticated user.
        /// Each item includes basic public profile information and whether the current user
        /// follows that user back.
        /// </remarks>
        /// <param name="page">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items to retrieve per page.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Returns a paginated list of followers for the authenticated user.</returns>
        /// <response code="200">The followers list was retrieved successfully.</response>
        /// <response code="401">The request is unauthorized.</response>
        [Authorize]
        [HttpGet("me/followers")]
        public async Task<ActionResult<FollowListResponse>> GetMyFollowers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var currentUserId = GetCurrentUserId();

            var response = await _sender.Send(
                new GetFollowersQuery(currentUserId, currentUserId, page, pageSize),
                cancellationToken);

            return Ok(response);
        }
        
        /// <summary>
        /// Gets the list of users followed by the currently authenticated user.
        /// </summary>
        /// <remarks>
        /// Returns a paginated list of users that the currently authenticated user follows.
        /// Each item includes basic public profile information and whether the current user
        /// follows that user.
        /// </remarks>
        /// <param name="page">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items to retrieve per page.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Returns a paginated list of users followed by the authenticated user.</returns>
        /// <response code="200">The following list was retrieved successfully.</response>
        /// <response code="401">The request is unauthorized.</response>
        [Authorize]
        [HttpGet("me/following")]
        public async Task<ActionResult<FollowListResponse>> GetMyFollowing(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var currentUserId = GetCurrentUserId();

            var response = await _sender.Send(
                new GetFollowingUsersQuery(currentUserId, currentUserId, page, pageSize),
                cancellationToken);

            return Ok(response);
        }
        
        /// <summary>
        /// Gets the list of followers of a specific user.
        /// </summary>
        /// <remarks>
        /// Returns a paginated list of users who follow the specified user.
        /// This endpoint is publicly accessible. If the requester is authenticated,
        /// each item also indicates whether the requester is following that user.
        /// </remarks>
        /// <param name="userId">The unique identifier of the user whose followers will be retrieved.</param>
        /// <param name="page">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items to retrieve per page.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Returns a paginated list of followers for the specified user.</returns>
        /// <response code="200">The followers list was retrieved successfully.</response>
        /// <response code="404">The specified user could not be found.</response>
        [AllowAnonymous]
        [HttpGet("{userId:guid}/followers")]
        public async Task<ActionResult<FollowListResponse>> GetUserFollowers(
            Guid userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            PublicUserProfileResponse? user = await _sender.Send(
                new GetPublicUserProfileQuery(userId),
                cancellationToken);

            if (user is null)
                return NotFound();

            var response = await _sender.Send(
                new GetFollowersQuery(userId, TryGetCurrentUserId(), page, pageSize),
                cancellationToken);

            return Ok(response);
        }
        
        /// <summary>
        /// Gets the list of users followed by a specific user.
        /// </summary>
        /// <remarks>
        /// Returns a paginated list of users that the specified user follows.
        /// This endpoint is publicly accessible. If the requester is authenticated,
        /// each item also indicates whether the requester is following that user.
        /// </remarks>
        /// <param name="userId">The unique identifier of the user whose following list will be retrieved.</param>
        /// <param name="page">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items to retrieve per page.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Returns a paginated list of users followed by the specified user.</returns>
        /// <response code="200">The following list was retrieved successfully.</response>
        /// <response code="404">The specified user could not be found.</response>
        [AllowAnonymous]
        [HttpGet("{userId:guid}/following")]
        public async Task<ActionResult<FollowListResponse>> GetUserFollowing(
            Guid userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            PublicUserProfileResponse? user = await _sender.Send(
                new GetPublicUserProfileQuery(userId),
                cancellationToken);

            if (user is null)
                return NotFound();

            var response = await _sender.Send(
                new GetFollowingUsersQuery(userId, TryGetCurrentUserId(), page, pageSize),
                cancellationToken);

            return Ok(response);
        }
        
        /// <summary>
        /// Searches users by username or display name.
        /// </summary>
        /// <param name="query">
        /// Text used to search users. The search is case-insensitive and supports partial
        /// matches in both username and display name.
        /// </param>
        /// <param name="page">The page number to retrieve. Default is 1.</param>
        /// <param name="pageSize">The number of results per page. Default is 20.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>
        /// Returns a paginated list of matching users.
        /// </returns>
        /// <remarks>
        /// This endpoint searches users using partial and case-insensitive matches on:
        /// - Username, through the identity service
        /// - DisplayName, through the user profile repository
        ///
        /// Business rules:
        /// - Excludes banned users
        /// - Excludes disabled users
        /// - Supports pagination using page and pageSize
        /// - Optionally excludes the authenticated user from the results
        ///
        /// Ordering priority:
        /// 1. Exact match on Username
        /// 2. Username starts with the query text
        /// 3. Exact match on DisplayName
        /// 4. DisplayName starts with the query text
        /// 5. Partial match on DisplayName
        /// 6. Remaining matches
        ///
        /// Example request:
        ///
        ///     GET /api/users/search?query=gabriel&page=1&pageSize=10
        ///
        /// </remarks>
        /// <response code="200">Returns the paginated list of matching users.</response>
        /// <response code="400">Returned when the query is empty or invalid.</response>
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchUsers(
            [FromQuery] string query,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query is required.");

            var request = new SearchUsersQuery(
                query.Trim(),
                page,
                pageSize,
                TryGetCurrentUserId());

            PaginatedList<UserSearchItemDto> result = await _sender.Send(request, ct);

            return Ok(result);
        }

        private Guid GetCurrentUserId() {
            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid userId))
                throw new UnauthorizedAccessException("User ID not found in claims.");

            return userId;
        }
        
        private Guid? TryGetCurrentUserId() {
            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (Guid.TryParse(userIdClaim, out Guid userId))
                return userId;

            return null;
        }
    }
}