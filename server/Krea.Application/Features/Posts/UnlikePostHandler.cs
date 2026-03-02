namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Repositories;
    using Dto;

    public sealed class UnlikePostHandler
        : IRequestHandler<UnlikePostCommand, Unit>
    {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UnlikePostHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            UnlikePostCommand command,
            CancellationToken ct)
        {
            var post = await _postRepository
                .GetFullPostAsync(command.PostId, ct);

            if (post is null)
                throw new Exception("Post not found");

            post.RemoveLike(command.UserId);

            await _unitOfWork.SaveChangesAsync(ct);

            return Unit.Value;
        }
    }
}