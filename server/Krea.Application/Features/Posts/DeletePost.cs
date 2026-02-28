namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Repositories;

    public sealed class DeletePost
        : IRequestHandler<DeletePost.Request, DeletePost.Response>
    {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeletePost(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public sealed record Request(Guid PostId)
            : IRequest<Response>;

        public sealed record Response(bool Success);

        public async Task<Response> Handle(
            Request request,
            CancellationToken cancellationToken)
        {
            var post = await _postRepository
                           .GetByIdAsync(request.PostId, cancellationToken)
                       ?? throw new Exception("Post not found");

            post.Delete();

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new Response(true);
        }
    }
}