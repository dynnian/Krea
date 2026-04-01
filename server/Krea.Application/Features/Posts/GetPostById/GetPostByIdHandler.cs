namespace Krea.Application.Features.Posts.GetPostById {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class GetPostByIdHandler
        : IRequestHandler<GetPostByIdCommand, GetPostByIdResponse?> {
        private readonly IPostRepository _postRepository;

        public GetPostByIdHandler(IPostRepository postRepository) {
            _postRepository = postRepository;
        }

        public async Task<GetPostByIdResponse?> Handle(
            GetPostByIdCommand request,
            CancellationToken cancellationToken)
        {
            Post? post = await _postRepository
                .GetFullPostAsync(request.PostId, cancellationToken);

            if (post is null)
                return null;

            Guid? currentUserId = request.CurrentUserId;

            // Media del post actual
            IReadOnlyList<PostMediaDto> media = post.Uploads
                .Select(u => new PostMediaDto
                {
                    Id = u.Id,
                    FileName = u.Media.FileName,
                    MimeType = u.Media.MimeType,
                    Url = u.Media.Path,
                    IsWorkMedia = u.IsWorkMedia
                })
                .ToList();

            // Like
            bool isLiked = currentUserId is not null &&
                           post.Likes.Any(l => l.UserId == currentUserId);

            // Repost del usuario actual sobre el contenido canónico
            bool isRetweeted = false;
            if (currentUserId is not null)
            {
                Guid repostTargetId = post.RepostOfId ?? post.Id;

                isRetweeted = await _postRepository.ExistsRepostAsync(
                    repostTargetId,
                    currentUserId.Value,
                    cancellationToken);
            }

            // Replies
            var (replyPosts, _) = await _postRepository.GetRepliesAsync(
                post.Id,
                page: 1,
                pageSize: 10,
                cancellationToken);

            IReadOnlyList<ReplyDto> replies = replyPosts
                .Select(r => new ReplyDto(
                    r.Id,
                    r.AuthorPostId,
                    r.AuthorPost.DisplayName,
                    r.Content,
                    r.UploadedAt
                ))
                .ToList();

            // Referencia al post original si este post es repost
            RepostReferenceDto? repostOf = post.RepostOf is null
                ? null
                : new RepostReferenceDto(
                    post.RepostOf.Id,
                    post.RepostOf.AuthorPostId,
                    post.RepostOf.AuthorPost.DisplayName,
                    post.RepostOf.Title,
                    post.RepostOf.Content,
                    post.RepostOf.IsWork,
                    post.RepostOf.IsLocal,
                    post.RepostOf.Uploads.Count,
                    post.RepostOf.Likes.Count,
                    post.RepostOf.UploadedAt,
                    post.RepostOf.Uploads
                        .Select(u => new PostMediaDto
                        {
                            Id = u.Id,
                            FileName = u.Media.FileName,
                            MimeType = u.Media.MimeType,
                            Url = u.Media.Path,
                            IsWorkMedia = u.IsWorkMedia
                        })
                        .ToList()
                );

            return new GetPostByIdResponse(
                post.Id,
                post.AuthorPostId,
                post.AuthorPost.DisplayName,
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
    }
}