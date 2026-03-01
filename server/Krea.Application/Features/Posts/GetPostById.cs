namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetPostById
        : IRequestHandler<GetPostById.Request, GetPostById.Response?> {
        private readonly IPostRepository _postRepository;

        public GetPostById(IPostRepository postRepository) => _postRepository = postRepository;

        public sealed record Request(Guid PostId)
            : IRequest<Response?>;

        public sealed record Response(
            Guid Id,
            Guid AuthorPostId,
            string Title,
            string? Content,
            bool IsWork,
            bool IsLocal,
            int UploadCount,
            int LikesCount,
            DateTime UploadedAt
        );

        public async Task<Response?> Handle(
            Request request,
            CancellationToken cancellationToken) {
            Post? post = await _postRepository
                .GetFullPostAsync(request.PostId, cancellationToken);

            if (post is null)
                return null;

            return new Response(
                post.Id,
                post.AuthorPostId,
                post.Title,
                post.Content,
                post.IsWork,
                post.IsLocal,
                post.Uploads.Count,
                post.Likes.Count,
                post.UploadedAt
            );
        }
    }
}