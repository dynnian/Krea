namespace Krea.Application.Features.Posts.GetPostById {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetPostByIdHandler
        : IRequestHandler<GetPostByIdCommand, GetPostByIdResponse?>
    {
        private readonly IPostRepository _postRepository;

        public GetPostByIdHandler(IPostRepository postRepository)
        {
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

            return new GetPostByIdResponse(
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