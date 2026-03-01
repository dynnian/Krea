namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;

    public sealed class CreatePost
        : IRequestHandler<CreatePost.Request, CreatePost.Response> {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreatePost(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork) {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public sealed record Request(
            Guid AuthorPostId,
            PostType Type,
            string Title,
            string? Content,
            bool IsWork,
            bool IsLocal
        ) : IRequest<Response>;

        public sealed record Response(Guid PostId);

        public async Task<Response> Handle(
            Request request,
            CancellationToken cancellationToken) {
            var post = new Post(
                request.AuthorPostId,
                request.Type,
                request.Title,
                request.Content ?? string.Empty,
                request.IsWork,
                request.IsLocal
            );

            await _postRepository.AddAsync(post, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new Response(post.Id);
        }
    }
}