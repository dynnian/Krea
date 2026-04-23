namespace Krea.Application.Features.Posts.GetPostById {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class GetPostByIdHandler
        : IRequestHandler<GetPostByIdCommand, GetPostByIdResponse?> {
        private readonly IPostRepository _postRepository;

        public GetPostByIdHandler(IPostRepository postRepository) => _postRepository = postRepository;

        public async Task<GetPostByIdResponse?> Handle(
            GetPostByIdCommand request,
            CancellationToken cancellationToken) {
            Post? post = await _postRepository
                .GetFullPostAsync(request.PostId, cancellationToken);

            if (post is null)
                return null;

            Guid? currentUserId = request.CurrentUserId;

            IReadOnlyList<PostMediaDto> media = post.Uploads
                                                    .Select(MapPostMedia)
                                                    .ToList();

            bool isLiked = currentUserId is not null &&
                           post.Likes.Any(l => l.UserId == currentUserId);

            bool isRetweeted = false;
            if (currentUserId is not null) {
                Guid repostTargetId = post.RepostOfId ?? post.Id;

                isRetweeted = await _postRepository.ExistsRepostAsync(
                    repostTargetId,
                    currentUserId.Value,
                    cancellationToken);
            }

            (IReadOnlyList<Post> replyPosts, _) = await _postRepository.GetRepliesAsync(
                post.Id,
                1,
                10,
                cancellationToken);

            IReadOnlyList<ReplyDto> replies = replyPosts
                                              .Select(r => new ReplyDto(
                                                  r.Id,
                                                  r.AuthorPostId,
                                                  r.AuthorPost.DisplayName,
                                                  r.Content ?? string.Empty,
                                                  r.UploadedAt
                                              ))
                                              .ToList();

            RepostReferenceDto? repostOf = post.RepostOf is null
                ? null
                : new RepostReferenceDto(
                    post.RepostOf.Id,
                    post.RepostOf.AuthorPostId,
                    post.RepostOf.AuthorPost.DisplayName,
                    post.RepostOf.AuthorPost.ProfilePicture?.Path,
                    post.RepostOf.Title,
                    post.RepostOf.Content,
                    post.RepostOf.IsWork,
                    post.RepostOf.IsLocal,
                    post.RepostOf.Uploads.Count,
                    post.RepostOf.Likes.Count,
                    post.RepostOf.UploadedAt,
                    post.RepostOf.Uploads
                        .Select(MapPostMedia)
                        .ToList()
                );

            return new GetPostByIdResponse(
                post.Id,
                post.AuthorPostId,
                post.AuthorPost.DisplayName,
                post.AuthorPost.ProfilePicture?.Path,
                post.Title,
                post.Content,
                post.IsWork,
                post.IsLocal,
                post.Uploads.Count,
                post.Likes.Count,
                post.UploadedAt,
                media,
                isLiked,
                isRetweeted,
                replies,
                post.RepostOfId,
                repostOf
            );
        }

        private static PostMediaDto MapPostMedia(PostUpload upload) =>
            new() {
                Id = upload.Id,
                FileName = upload.Media.FileName,
                MimeType = upload.Media.MimeType,
                Url = upload.Media.Path,
                IsWorkMedia = upload.IsWorkMedia,
                CoverMediaId = upload.CoverMediaId,
                CoverUrl = upload.CoverMedia?.Path,
                CoverMimeType = upload.CoverMedia?.MimeType
            };
    }
}