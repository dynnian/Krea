namespace Krea.API.Controllers {
    using Application.Abstractions;
    using Application.Features.Favorites.AddPostToFavorites;
    using Application.Features.Favorites.Dto;
    using Application.Features.Favorites.GetUserFavorites;
    using Application.Features.Favorites.RemovePostFromFavorites;
    using Application.Features.Favorites.TogglePostFavorite;
    using Application.Features.Genres;
    using Application.Features.Genres.GetAllGenres;
    using Application.Features.Posts.CreatePost;
    using Application.Features.Posts.DeletePost;
    using Application.Features.Posts.Dto;
    using Application.Features.Posts.Explore;
    using Application.Features.Posts.GetAllPosts;
    using Application.Features.Posts.GetPostById;
    using Application.Features.Posts.GetPostsByUser;
    using Application.Features.Posts.Hashtag;
    using Application.Features.Posts.Like;
    using Application.Features.Posts.ReplyPost;
    using Application.Features.Posts.ReplyPost.GetReplies;
    using Application.Features.Posts.Repost;
    using Application.Features.PostUploads.CreatePostUpload;
    using Contracts;
    using Domain.Abstractions;
    using Domain.Entities;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;


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
        [AllowAnonymous]
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
        /// <param name="authorPostId">Identifier of the user whose posts will be retrieved.</param>
        /// <param name="page">Page number to retrieve. Default is 1.</param>
        /// <param name="pageSize">Number of posts per page. Default is 10.</param>
        /// <param name="ct">Token used to cancel the request.</param>
        /// <returns>
        /// A paginated collection of posts authored by the specified user.
        /// </returns>
        [HttpGet("user/{authorId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByUser(
            Guid authorId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken ct = default)
        {
            Guid? currentUserId = null;

            if (User.Identity?.IsAuthenticated == true) {
                currentUserId = GetCurrentUserId();
            }

            var result = await _sender.Send(
                new GetPostsByUserQuery(
                    authorId,
                    page,
                    pageSize,
                    currentUserId),
                ct);

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
        [AllowAnonymous]
        public async Task<IActionResult> GetById(
            Guid id,
            CancellationToken cancellationToken = default) {
            Guid? currentUserId = null;

            if (User.Identity?.IsAuthenticated == true) {
                currentUserId = GetCurrentUserId();
            }

            GetPostByIdResponse? result = await _sender.Send(
                new GetPostByIdCommand(id, currentUserId),
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
        [Authorize]
        public async Task<IActionResult> Create(
            [FromBody] CreatePostCommand command,
            CancellationToken cancellationToken = default) {
            Guid authorPostId = GetCurrentUserId();
            if (command.AuthorPostId != authorPostId)
                return Unauthorized();

            CreatePostResponse result = await _sender.Send(command, cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.PostId },
                result);
        }

        /// <summary>
        /// Deletes an existing post.
        /// </summary>
        /// <param name="postId">Identifier of the post to delete.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// A <c>204 No Content</c> response if the deletion was successful.
        /// </returns>
        [HttpDelete("{postId:guid}")]
        [Authorize]
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
        [Authorize]
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
        /// Obtiene los comentarios (replies) de un post.
        /// </summary>
        /// <param name="postId">ID del post</param>
        /// <param name="mode">Flat | Tree</param>
        /// <param name="page">Página (solo flat)</param>
        /// <param name="pageSize">Tamaño de página (solo flat)</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        [HttpGet("{postId:guid}/replies")]
        public async Task<IActionResult> GetReplies(
            Guid postId,
            [FromQuery] ReplyMode? mode,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default) {
            ReplyMode finalMode = mode ?? ReplyMode.Flat;
            RepliesResponse result = await _sender.Send(
                new GetRepliesQuery(postId, page, pageSize, finalMode),
                cancellationToken);

            return Ok(result);
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
        [Authorize]
        public async Task<IActionResult> Repost(
            Guid postId,
            [FromBody] RepostPostCommand command,
            CancellationToken cancellationToken) {
            Guid currentUserId = GetCurrentUserId();

            Guid repostId = await _sender.Send(
                command with { OriginalPostId = postId, AuthorId = currentUserId },
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
        [Authorize]
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
        [Authorize]
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
        /// <param name="request">Request containing file and editorial metadata information.</param>
        /// <param name="cancellationToken">Token used to cancel the request.</param>
        /// <returns>
        /// Returns the result of the upload operation, including metadata about the uploaded media.
        /// </returns>
        [HttpPost("{postId:guid}/uploads")]
        [Authorize]
        public async Task<IActionResult> CreateUpload(
            Guid postId,
            [FromForm] CreatePostUploadRequest request,
            CancellationToken cancellationToken) {
            await using Stream fileStream = request.File.OpenReadStream();
            await using Stream? coverStream = request.Cover?.OpenReadStream();

            var command = new CreatePostUploadCommand(
                postId,
                fileStream,
                request.File.FileName,
                request.File.ContentType,
                request.File.Length,
                request.Type,
                request.Title,
                request.Description,
                request.GenreIds,
                request.SortTitle,
                request.Subtitle,
                request.LanguageCode,
                request.IsWorkMedia,
                coverStream,
                request.Cover?.FileName,
                request.Cover?.ContentType,
                request.Cover?.Length
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
        [AllowAnonymous]
        public async Task<IActionResult> Explore(
            [FromQuery] ExploreQuery query,
            CancellationToken cancellationToken) {
            PagedResult<ExplorePostDto> result = await _sender.Send(query, cancellationToken);
            return Ok(result);
        }
        
        /// <summary>
        /// Retrieves all available genres.
        /// </summary>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>
        /// Returns the complete list of genres registered in the system.
        /// </returns>
        /// <remarks>
        /// This endpoint returns all genres that can be used across the platform,
        /// including their identifier, display name and type.
        /// 
        ///<para><b>Possible genre types:</b></para>
        /// <list type="bullet">
        /// <item><description>Image</description></item>
        /// <item><description>Music</description></item>
        /// <item><description>Text</description></item>
        /// </list>
        /// Example request:
        ///
        ///     GET /api/genres
        ///
        /// Example response:
        ///
        ///     [
        ///       {
        ///         "id": "11",
        ///         "name": "Rock",
        ///         "type": "Music"
        ///       }, {...}
        ///     ]
        /// </remarks>
        /// <response code="200">Genres retrieved successfully.</response>
        [HttpGet("genres")]
        [ProducesResponseType(typeof(IReadOnlyList<GenreDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            IReadOnlyList<GenreDto> result = await _sender.Send(
                new GetAllGenresCommand(),
                ct);

            return Ok(result);
        }

        /// <summary>
        /// Asigna géneros a un upload de un post.
        /// </summary>
        /// <param name="uploadId">Command containing uploaded media information.</param>
        /// <param name="request">Command containing list of genres.</param>
        /// <param name="cancellationToken"></param>
        /// <returns>
        /// A <c>204 No Content</c> response if the assignGenres operation succeeds.
        /// </returns>
        [HttpPost("uploads/{uploadId:guid}/genres")]
        [Authorize]
        public async Task<IActionResult> AssignGenres(
            Guid uploadId,
            [FromBody] AssignGenresRequest request,
            CancellationToken cancellationToken) {
            await _sender.Send(
                new AssignGenresToUploadCommand(uploadId, request.GenreIds),
                cancellationToken);

            return NoContent();
        }

        /// <summary>
        /// Añade un hashtag a un post.
        /// </summary>
        [HttpPost("{postId:guid}/hashtags")]
        [Authorize]
        public async Task<IActionResult> AddHashtag(
            Guid postId,
            [FromBody] AddHashtagRequest request,
            CancellationToken cancellationToken) {
            await _sender.Send(
                new AddHashtagCommand(postId, request.Name),
                cancellationToken);

            return NoContent();
        }

        /// <summary>
        /// Elimina un hashtag de un post.
        /// </summary>
        /// <param name="postId">Command containing the post reference.</param>
        /// <param name="hashtagId">Command containing the hashtag removed.</param>>
        /// <param name="cancellationToken"></param>
        [HttpDelete("{postId:guid}/hashtags/{hashtagId:guid}")]
        [Authorize]
        public async Task<IActionResult> RemoveHashtag(
            Guid postId,
            Guid hashtagId,
            CancellationToken cancellationToken) {
            await _sender.Send(
                new RemoveHashtagCommand(postId, hashtagId),
                cancellationToken);

            return NoContent();
        }

        [HttpGet("hashtags")]
        [Authorize]
        public async Task<IActionResult> GetAllHashtags() {
            IReadOnlyList<Hashtag> result = await _sender.Send(new GetAllHashtagsQuery());
            return Ok(result);
        }

        [HttpPost("{postId}/favorite")]
        [Authorize]
        public async Task<IActionResult> AddToFavorites(Guid postId) {
            Guid userId = GetCurrentUserId();

            bool result = await _sender.Send(
                new AddPostToFavoritesCommand(userId, postId));

            if (!result)
                return BadRequest("Post already in favorites.");

            return Ok();
        }

        [HttpDelete("{postId}/favorite")]
        [Authorize]
        public async Task<IActionResult> RemoveFromFavorites(Guid postId) {
            Guid userId = GetCurrentUserId();

            bool result = await _sender.Send(
                new RemovePostFromFavoritesCommand(userId, postId));

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("me/favorites")]
        [Authorize]
        public async Task<IActionResult> GetFavorites(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10) {
            Guid userId = GetCurrentUserId();
            FavoritePostsResponse result = await _sender.Send(new GetUserFavoritesQuery(userId, page, pageSize));
            return Ok(result);
        }

        [HttpPost("{postId}/favorite/toggle")]
        [Authorize]
        public async Task<IActionResult> ToggleFavorite(Guid postId) {
            Guid userId = GetCurrentUserId();

            bool isFavorite = await _sender.Send(
                new TogglePostFavoriteCommand(userId, postId));

            return Ok(new { isFavorite });
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