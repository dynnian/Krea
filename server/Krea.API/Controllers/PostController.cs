namespace Krea.API.Controllers {
    using Application.Features.Posts;
    using Application.Features.Posts.Dto;
    using Application.Features.Posts.GetAllPosts;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    public sealed class PostsController : ControllerBase {
        private readonly ISender _sender;

        public PostsController(ISender sender) => _sender = sender;

        // GET: api/posts?page=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default) {
            IReadOnlyList<PostDto> result = await _sender.Send(
                new GetAllPostsQuery(page, pageSize),
                cancellationToken);

            return Ok(result);
        }

        // GET: api/posts/user/{authorId}
        [HttpGet("user/{authorId:guid}")]
        public async Task<IActionResult> GetByUser(
            Guid authorId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var result = await _sender.Send(
                new GetPostsByUserQuery(authorId, page, pageSize),
                cancellationToken);
        
            return Ok(result);
        }

        // GET: api/posts/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(
            Guid id,
            CancellationToken cancellationToken = default) {
            GetPostById.Response? result = await _sender.Send(
                new GetPostById.Request(id),
                cancellationToken);

            if (result is null)
                return NotFound();

            return Ok(result);
        }

        // POST: api/posts
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreatePost.Request request, CancellationToken cancellationToken = default) {
            CreatePost.Response result = await _sender.Send(request, cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.PostId },
                result);
        }

        // POST: api/posts/{postId}/upload
        [HttpPost("{postId:guid}/upload")]
        public async Task<IActionResult> AddUpload(
            Guid postId,
            [FromBody] AddUploadRequest request,
            CancellationToken cancellationToken) {
            AddUpload.Response response = await _sender.Send(
                new AddUpload.Request(
                    postId,
                    request.MediaId,
                    request.IsWorkMedia),
                cancellationToken);

            return Ok(response);
        }

        // DELETE: api/posts/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(
            Guid id,
            CancellationToken cancellationToken = default) {
            await _sender.Send(
                new DeletePost.Request(id),
                cancellationToken);

            return NoContent();
        }
        
        [HttpPost("{postId:guid}/reply")]
        public async Task<IActionResult> Reply(
            Guid postId,
            [FromBody] ReplyPostCommand command,
            CancellationToken cancellationToken)
        {
            Guid replyId = await _sender.Send(
                command with { ReplyToPostId = postId },
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = replyId },
                new { ReplyPostId = replyId });
        }
        
        [HttpPost("{postId:guid}/repost")]
        public async Task<IActionResult> Repost(
            Guid postId,
            [FromBody] RepostPostCommand command,
            CancellationToken cancellationToken)
        {
            Guid repostId = await _sender.Send(
                command with { OriginalPostId = postId },
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = repostId },
                new { RepostId = repostId });
        }
        
        // POST   /posts/{id}/like
        [HttpPost("{postId:guid}/like")]
        public async Task<IActionResult> Like(
            Guid postId,
            [FromBody] LikePostCommand command,
            CancellationToken cancellationToken)
        {
            await _sender.Send(
                command with { PostId = postId },
                cancellationToken);

            return NoContent();
        }
        
        //DELETE /posts/{id}/unlike
        [HttpDelete("{postId:guid}/unlike")]
        public async Task<IActionResult> Unlike(
            Guid postId,
            [FromBody] UnlikePostCommand command,
            CancellationToken cancellationToken)
        {
            await _sender.Send(
                command with { PostId = postId },
                cancellationToken);

            return NoContent();
        }
    }
}