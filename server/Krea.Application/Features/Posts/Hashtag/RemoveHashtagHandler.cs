namespace Krea.Application.Features.Posts.Hashtag {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class RemoveHashtagHandler
        : IRequestHandler<RemoveHashtagCommand, Unit> {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RemoveHashtagHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork) {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(RemoveHashtagCommand command, CancellationToken ct) {
            Post? post = await _postRepository
                .GetFullPostAsync(command.PostId, ct);

            if (post is null)
                throw new InvalidOperationException("Post not found");

            post.RemoveHashtag(command.HashtagId);

            await _unitOfWork.SaveChangesAsync(ct);

            return Unit.Value;
        }
    }
}