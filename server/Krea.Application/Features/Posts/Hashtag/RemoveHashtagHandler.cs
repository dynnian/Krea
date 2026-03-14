namespace Krea.Application.Features.Posts.Hashtag {
    using Domain.Abstractions;
    using Domain.Repositories;
    using Dto;

    public sealed class RemoveHashtagHandler
    {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RemoveHashtagHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(RemoveHashtagCommand command, CancellationToken ct)
        {
            var post = await _postRepository
                .GetFullPostAsync(command.PostId, ct);

            if (post is null)
                throw new InvalidOperationException("Post not found");

            post.RemoveHashtag(command.HashtagId);
            await _unitOfWork.SaveChangesAsync(ct);
        }
    }
}