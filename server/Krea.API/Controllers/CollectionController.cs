namespace Krea.API.Controllers {
    using Application.Features.Collections.AddPostToCollection;
    using Application.Features.Collections.CreateCollection;
    using Application.Features.Collections.DeleteCollection;
    using Application.Features.Collections.Dto;
    using Application.Features.Collections.GetCollectionById;
    using Application.Features.Collections.GetUserCollections;
    using Application.Features.Collections.RemovePostFromCollection;
    using Application.Features.Collections.UpdateCollectionTitle;
    using Application.Features.Collections.UploadCollectionCover;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    /// <summary>
    /// Provides endpoints to manage user collections and the posts saved inside them.
    /// </summary>
    /// <remarks>
    /// Collections allow users to organize and save posts for later reference.
    /// </remarks>
    [Authorize]
    [ApiController]
    [Route("api/collections")] 
    public sealed class CollectionsController : ControllerBase { 
        private readonly ISender _sender;
        
        public CollectionsController(ISender sender) { 
            _sender = sender; 
        }
        
        /// <summary>
        /// Creates a new collection for a user.
        /// </summary>
        /// <param name="request">
        /// The request containing the collection title, description and owner identifier.
        /// </param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>
        /// Returns the newly created collection information including its identifier.
        /// </returns>
        /// <response code="200">Collection created successfully.</response>
        /// <response code="400">Invalid request data.</response>
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromForm] CreateCollectionRequest request,
            CancellationToken ct)
        {
            Guid ownerId = GetCurrentUserId();

            using Stream? coverStream = request.Cover?.OpenReadStream();

            var command = new CreateCollectionCommand(
                ownerId,
                request.Title,
                request.Description,
                request.Type,
                coverStream,
                request.Cover?.FileName,
                request.Cover?.ContentType,
                request.Cover?.Length
            );

            var response = await _sender.Send(command, ct);

            return CreatedAtAction(
                nameof(GetCollection),
                new { collectionId = response.Id, page = 1, pageSize = 20 },
                response);
        }

        /// <summary>
        /// Retrieves all collections owned by a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user who owns the collections.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>
        /// A list of collections belonging to the specified user.
        /// </returns>
        /// <response code="200">Collections retrieved successfully.</response>
        /// <response code="404">User not found.</response>
        [HttpGet("user/{userId:guid}")] 
        public async Task<IActionResult> GetUserCollections(
            Guid userId, 
            CancellationToken ct) 
        { 
            var result = await _sender.Send(
                new GetUserCollectionsQuery(userId), 
                ct);
            
            return Ok(result); 
        }

        /// <summary>
        /// Deletes an existing collection.
        /// </summary>
        /// <param name="collectionId">The identifier of the collection to delete.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>No content if the deletion was successful.</returns>
        /// <response code="204">Collection deleted successfully.</response>
        /// <response code="404">Collection not found.</response>
        [HttpDelete("{collectionId:guid}")] 
        public async Task<IActionResult> DeleteCollection(
            Guid collectionId, 
            CancellationToken ct) 
        { 
            await _sender.Send(
                new DeleteCollectionCommand(collectionId), 
                ct);
            
            return NoContent(); 
        }

        /// <summary>
        /// Adds a post to an existing collection.
        /// </summary>
        /// <param name="collectionId">The identifier of the target collection.</param>
        /// <param name="request">The request containing the post identifier.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>
        /// Returns information about the post added to the collection.
        /// </returns>
        /// <response code="200">Post added successfully.</response>
        /// <response code="404">Collection or post not found.</response>
        [HttpPost("{collectionId:guid}/posts")] 
        public async Task<IActionResult> AddPost(
            Guid collectionId, 
            [FromBody] AddPostRequest request, 
            CancellationToken ct) 
        { 
            var result = await _sender.Send(
                new AddPostToCollectionCommand(
                    collectionId, 
                    request.PostId), 
                ct);
            
            return Ok(result); 
        }

        /// <summary>
        /// Removes a post from a collection.
        /// </summary>
        /// <param name="collectionId">The identifier of the collection.</param>
        /// <param name="postId">The identifier of the post to remove.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>No content if the removal was successful.</returns>
        /// <response code="204">Post removed successfully.</response>
        /// <response code="404">Collection or post not found.</response>
        [HttpDelete("{collectionId:guid}/posts/{postId:guid}")] 
        public async Task<IActionResult> RemovePost(
            Guid collectionId, 
            Guid postId, 
            CancellationToken ct) 
        { 
            await _sender.Send(
                new RemovePostFromCollectionCommand(
                    collectionId, 
                    postId), 
                ct);
            
            return NoContent(); 
        }

        /// <summary>
        /// Retrieves a collection and its posts.
        /// </summary>
        /// <param name="collectionId">The identifier of the collection.</param>
        /// <param name="page">The page number for pagination.</param>
        /// <param name="pageSize">The number of posts per page.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>
        /// The collection details including the paginated list of posts.
        /// </returns>
        /// <response code="200">Collection retrieved successfully.</response>
        /// <response code="404">Collection not found.</response>
        [HttpGet("{collectionId:guid}")] 
        public async Task<IActionResult> GetCollection(
            Guid collectionId, 
            int page = 1, 
            int pageSize = 20, 
            CancellationToken ct = default) 
        { 
            var result = await _sender.Send( 
                new GetCollectionByIdQuery( 
                    collectionId, 
                    page, 
                    pageSize), 
                ct);
            
            if (result is null) 
                return NotFound();
            
            return Ok(result); 
        }
        
        /// <summary>
        /// Uploads or replaces the cover image of a collection.
        /// </summary>
        /// <remarks>
        /// This endpoint allows the owner of a collection to upload a new cover image.
        /// 
        /// If the collection already has a cover:
        /// - The new image will replace the existing one.
        /// - The previous image will be removed from storage and database.
        /// 
        /// Supported file types: images only (e.g., jpg, png, webp).
        /// 
        /// The request must be sent as <c>multipart/form-data</c>.
        /// </remarks>
        /// <param name="collectionId">The unique identifier of the collection.</param>
        /// <param name="file">The image file to upload as the collection cover.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>
        /// Returns the uploaded media information including its identifier and accessible URL.
        /// </returns>
        /// <response code="200">Cover uploaded successfully.</response>
        /// <response code="400">Invalid file or request data.</response>
        /// <response code="404">Collection not found.</response>
        /// <response code="401">Unauthorized.</response>
        /// <response code="403">Forbidden. The user is not the owner of the collection.</response>
        [HttpPost("{collectionId:guid}/cover")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(UploadCollectionCoverResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> UploadCover(
            Guid collectionId,
            [FromForm] IFormFile file,
            CancellationToken cancellationToken)
        {
            if (file is null || file.Length == 0)
                return BadRequest("File is required.");

            await using var stream = file.OpenReadStream();

            var command = new UploadCollectionCoverCommand(
                collectionId,
                file.FileName,
                file.ContentType,
                file.Length,
                stream);

            var result = await _sender.Send(command, cancellationToken);

            return Ok(result);
        }

        /// <summary>
        /// Updates the title of an existing collection.
        /// </summary>
        /// <param name="collectionId">The identifier of the collection.</param>
        /// <param name="request">The new title.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>The updated collection information.</returns>
        /// <response code="200">Title updated successfully.</response>
        /// <response code="400">Invalid title.</response>
        /// <response code="404">Collection not found.</response>
        /// <response code="401">Unauthorized.</response>
        /// <response code="403">Forbidden. The user is not the owner.</response>
        [HttpPut("{collectionId:guid}/title")]
        public async Task<IActionResult> UpdateTitle(
            Guid collectionId,
            [FromBody] UpdateCollectionTitleRequest request,
            CancellationToken ct)
        {
            var currentUserId = GetCurrentUserId();
            var command = new UpdateCollectionTitleCommand(collectionId, currentUserId, request.Title);
            var result = await _sender.Send(command, ct);
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