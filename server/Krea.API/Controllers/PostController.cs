namespace Krea.API.Controllers {
    using Application.Features.Posts.CreatePost;
    using Application.Features.Posts.DeletePost;
    using Application.Features.Posts.Dto;
    using Application.Features.Posts.Explore;
    using Application.Features.Posts.GetAllPosts;
    using Application.Features.Posts.GetPostById;
    using Application.Features.Posts.GetPostsByUser;
    using Application.Features.Posts.Like;
    using Application.Features.Posts.ReplyPost;
    using Application.Features.Posts.Repost;
    using Application.Features.PostUploads.CreatePostUpload;
    using Contracts;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;


    /// <summary>
    /// Controller responsible for managing post-related operations within the platform.
    /// </summary>
    /// <remarks>
    /// This controller exposes endpoints to create, retrieve, interact with,
    /// and manage posts such as replies, reposts, likes, and media uploads.
    /// 
    /// All endpoints require authentication.
    /// </remarks>
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public sealed class PostsController : ControllerBase {
        private readonly ISender _sender;

        /// <summary>
        /// Initializes a new instance of the <see cref="PostsController"/> class.
        /// </summary>
        /// <param name="sender">
        /// Mediator used to dispatch application commands and queries.
        /// </param>
        public PostsController(ISender sender) => _sender = sender;

        /// <summary>
        /// Retrieves a paginated list of all posts available in the platform.
        /// </summary>
        /// <param name="page">Page number to retrieve. Default is 1.</param>
        /// <param name="pageSize">Number of posts per page. Default is 10.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// A list of <see cref="PostDto"/> representing the posts for the requested page.
        /// </returns>
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

        /// <summary>
        /// Retrieves a paginated list of posts created by a specific user.
        /// </summary>
        /// <param name="authorId">Identifier of the user whose posts will be retrieved.</param>
        /// <param name="page">Page number to retrieve. Default is 1.</param>
        /// <param name="pageSize">Number of posts per page. Default is 10.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// A paginated collection of posts authored by the specified user.
        /// </returns>
        [HttpGet("user/{authorId:guid}")]
        public async Task<IActionResult> GetByUser(
            Guid authorId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default) {
            IReadOnlyList<PostDto> result = await _sender.Send(
                new GetPostsByUserQuery(authorId, page, pageSize),
                cancellationToken);

            return Ok(result);
        }

        /// <summary>
        /// Retrieves a specific post by its unique identifier.
        /// </summary>
        /// <param name="id">Unique identifier of the post.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// The post details if found; otherwise, a <c>404 Not Found</c> response.
        /// </returns>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(
            Guid id,
            CancellationToken cancellationToken = default) {
            GetPostByIdResponse? result = await _sender.Send(
                new GetPostByIdCommand(id),
                cancellationToken);

            if (result is null)
                return NotFound();

            return Ok(result);
        }

        /// <summary>
        /// Creates a new post.
        /// </summary>
        /// <param name="command">
        /// Command containing the data required to create the post.
        /// </param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// Returns the identifier of the newly created post.
        /// </returns>
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreatePostCommand command,
            CancellationToken cancellationToken = default) {
            CreatePostResponse result = await _sender.Send(command, cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.PostId },
                result);
        }

        // POST: api/posts/{postId}/upload
        // [HttpPost("{postId:guid}/upload")]
        // public async Task<IActionResult> AddUpload(
        //     Guid postId,
        //     [FromBody] AddUploadRequest request,
        //     CancellationToken cancellationToken) {
        //     AddUpload.Response response = await _sender.Send(
        //         new AddUpload.Request(
        //             postId,
        //             request.MediaId,
        //             request.IsWorkMedia),
        //         cancellationToken);
        //
        //     return Ok(response);
        // }

        /// <summary>
        /// Deletes an existing post.
        /// </summary>
        /// <param name="postId">Identifier of the post to delete.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// A <c>204 No Content</c> response if the deletion was successful.
        /// </returns>
        [HttpDelete("{postId:guid}")]
        public async Task<IActionResult> DeletePost(
            Guid postId,
            CancellationToken cancellationToken) {
            await _sender.Send(
                new DeletePostCommand(postId),
                cancellationToken);

            return NoContent();
        }

        /// <summary>
        /// Creates a reply to an existing post.
        /// </summary>
        /// <param name="postId">Identifier of the post being replied to.</param>
        /// <param name="command">Command containing reply content.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// Returns the identifier of the created reply post.
        /// </returns>
        [HttpPost("{postId:guid}/reply")]
        public async Task<IActionResult> Reply(
            Guid postId,
            [FromBody] ReplyPostCommand command,
            CancellationToken cancellationToken) {
            Guid replyId = await _sender.Send(
                command with { ReplyToPostId = postId },
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = replyId },
                new { ReplyPostId = replyId });
        }

        /// <summary>
        /// Creates a repost of an existing post.
        /// </summary>
        /// <param name="postId">Identifier of the original post.</param>
        /// <param name="command">Command containing repost information.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// Returns the identifier of the newly created repost.
        /// </returns>
        [HttpPost("{postId:guid}/repost")]
        public async Task<IActionResult> Repost(
            Guid postId,
            [FromBody] RepostPostCommand command,
            CancellationToken cancellationToken) {
            Guid repostId = await _sender.Send(
                command with { OriginalPostId = postId },
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = repostId },
                new { RepostId = repostId });
        }

        /// <summary>
        /// Adds a like to a post.
        /// </summary>
        /// <param name="postId">Identifier of the post to like.</param>
        /// <param name="command">Command containing like information.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// A <c>204 No Content</c> response if the like operation succeeds.
        /// </returns>
        [HttpPost("{postId:guid}/like")]
        public async Task<IActionResult> Like(
            Guid postId,
            [FromBody] LikePostCommand command,
            CancellationToken cancellationToken) {
            await _sender.Send(
                command with { PostId = postId },
                cancellationToken);

            return NoContent();
        }

        /// <summary>
        /// Removes a like from a post.
        /// </summary>
        /// <param name="postId">Identifier of the post to unlike.</param>
        /// <param name="command">Command containing unlike information.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// A <c>204 No Content</c> response if the unlike operation succeeds.
        /// </returns>
        [HttpDelete("{postId:guid}/unlike")]
        public async Task<IActionResult> Unlike(
            Guid postId,
            [FromBody] UnlikePostCommand command,
            CancellationToken cancellationToken) {
            await _sender.Send(
                command with { PostId = postId },
                cancellationToken);

            return NoContent();
        }

        /// <summary>
        /// Uploads media content associated with a post.
        /// </summary>
        /// <param name="postId">Identifier of the post where the media will be attached.</param>
        /// <param name="request">Request containing file and metadata information.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// Returns the result of the upload operation, including metadata about the uploaded media.
        /// </returns>
        [HttpPost("{postId:guid}/uploads")]
        public async Task<IActionResult> CreateUpload(
            Guid postId,
            [FromForm] CreatePostUploadRequest request,
            CancellationToken cancellationToken) {
            await using Stream stream = request.File.OpenReadStream();

            var command = new CreatePostUploadCommand(
                postId,
                stream,
                request.File.FileName,
                request.File.ContentType,
                request.File.Length,
                request.Type,
                request.Title,
                request.Description,
                request.GenreIds,
                request.Width,
                request.Height,
                request.FileSize,
                request.Format,
                request.BitrateKbps,
                request.DurationSec,
                request.WordCount,
                request.LanguageCode,
                request.SortTitle,
                request.Subtitle,
                request.IsWorkMedia
            );

            CreatePostUploadResponse result = await _sender.Send(command, cancellationToken);

            return Ok(result);
        }
        
        /// <summary>
        /// Explora contenido filtrando por categoria, generos y etiquetas.
        /// </summary>
        /// <param name="query">Parámetros de filtrado</param>
        /// <param name="cancellationToken"></param>
        /// <returns>Listado paginado de publicaciones</returns>
        [HttpGet("explore")]
        public async Task<IActionResult> Explore(
            [FromQuery] ExploreQuery query,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(query, cancellationToken);
            return Ok(result);
        }
    }
}