namespace Krea.Application.Features.Posts.CreatePost {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;

    public sealed class CreatePostHandler
        : IRequestHandler<CreatePostCommand, CreatePostResponse>
    {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreatePostHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<CreatePostResponse> Handle(
            CreatePostCommand request,
            CancellationToken cancellationToken)
        {
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

            return new CreatePostResponse(post.Id);
        }
    }
}