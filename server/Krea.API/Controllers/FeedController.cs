namespace Krea.API.Controllers {
    using Microsoft.AspNetCore.Mvc;
    using Application.Features.Feed;
    using Application.Features.Posts.Dto;
    using Microsoft.AspNetCore.Authorization;
    using System.Security.Claims;

    [ApiController]
    [Route("api/feed")]
    public sealed class FeedController : ControllerBase {
        private readonly GetRecentFeedHandler _recentHandler;
        private readonly GetTrendingFeedHandler _trendingHandler;
        private readonly GetFollowingFeedHandler _followingHandler;

        public FeedController(
            GetRecentFeedHandler recentHandler,
            GetTrendingFeedHandler trendingHandler,
            GetFollowingFeedHandler followingHandler) {
            _recentHandler = recentHandler;
            _trendingHandler = trendingHandler;
            _followingHandler = followingHandler;
        }

        [HttpGet("recent")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecent(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default) {
            Guid? currentUserId = null;

            if (User.Identity?.IsAuthenticated == true) {
                currentUserId = GetCurrentUserId();
            }

            var query = new GetRecentFeedQuery(currentUserId, page, pageSize);

            IReadOnlyList<PostFeedResponse> result = await _recentHandler.Handle(query, ct);

            return Ok(result);
        }

        [HttpGet("trending")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTrending(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default) {
            Guid? currentUserId = null;
            
            if (User.Identity?.IsAuthenticated == true) {
                currentUserId = GetCurrentUserId();
            }

            var query = new GetTrendingFeedQuery(currentUserId, page, pageSize);

            IReadOnlyList<PostFeedResponse> result = await _trendingHandler.Handle(query, ct);

            return Ok(result);
        }

        [HttpGet("following")]
        [Authorize]
        public async Task<IActionResult> GetFollowing(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default) {
            Guid currentUserId = GetCurrentUserId();

            var query = new GetFollowingFeedQuery(currentUserId, page, pageSize);

            IReadOnlyList<PostFeedResponse> result = await _followingHandler.Handle(query, ct);

            return Ok(result);
        }

        private Guid GetCurrentUserId() {
            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid userId)) {
                throw new UnauthorizedAccessException("User ID not found in claims.");
            }

            return userId;
        }
    }
}