namespace Krea.Application.Features.Posts.DeletePost {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class DeletePostHandler
        : IRequestHandler<DeletePostCommand, DeletePostResponse>
    {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeletePostHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<DeletePostResponse> Handle(
            DeletePostCommand request,
            CancellationToken cancellationToken)
        {
            Post post = await _postRepository
                            .GetByIdAsync(request.PostId, cancellationToken)
                        ?? throw new Exception("Post not found");

            post.Delete();

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new DeletePostResponse(true);
        }
    }
}