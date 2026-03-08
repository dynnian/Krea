namespace Krea.API.Controllers {
    using Microsoft.AspNetCore.Mvc;
    using Application.Features.Feed;
    using Application.Features.Posts;
    using Application.Features.Posts.Dto;

    [ApiController]
    [Route("api/feed")]
    public sealed class FeedController : ControllerBase
    {
        private readonly GetRecentFeedHandler _recentHandler;
        private readonly GetTrendingFeedHandler _trendingHandler;
        private readonly GetFollowingFeedHandler _followingHandler;

        public FeedController(
            GetRecentFeedHandler recentHandler,
            GetTrendingFeedHandler trendingHandler,
            GetFollowingFeedHandler followingHandler)
        {
            _recentHandler = recentHandler;
            _trendingHandler = trendingHandler;
            _followingHandler = followingHandler;
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecent(
            [FromQuery] Guid currentUserId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var query = new GetRecentFeedQuery(currentUserId, page, pageSize);

            var result = await _recentHandler.Handle(query, ct);

            return Ok(result);
        }

        [HttpGet("trending")]
        public async Task<IActionResult> GetTrending(
            [FromQuery] Guid currentUserId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var query = new GetTrendingFeedQuery(currentUserId, page, pageSize);

            var result = await _trendingHandler.Handle(query, ct);

            return Ok(result);
        }

        [HttpGet("following")]
        public async Task<IActionResult> GetFollowing(
            [FromQuery] Guid currentUserId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var query = new GetFollowingFeedQuery(currentUserId, page, pageSize);

            var result = await _followingHandler.Handle(query, ct);

            return Ok(result);
        }
    }
}