namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Repositories;
    using Dto;

    public sealed class LikePostHandler
        : IRequestHandler<LikePostCommand, Unit>
    {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public LikePostHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            LikePostCommand command,
            CancellationToken ct)
        {
            var post = await _postRepository
                .GetFullPostAsync(command.PostId, ct);

            if (post is null)
                throw new Exception("Post not found");

            post.AddLike(command.UserId);

            await _unitOfWork.SaveChangesAsync(ct);

            return Unit.Value;
        }
    }
}