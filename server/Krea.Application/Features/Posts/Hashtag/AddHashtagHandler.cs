namespace Krea.Application.Features.Posts.Hashtag {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class AddHashtagHandler  
        : IRequestHandler<AddHashtagCommand, Unit> {
        private readonly IPostRepository _postRepository;
        private readonly IHashtagRepository _hashtagRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AddHashtagHandler(
            IPostRepository postRepository,
            IHashtagRepository hashtagRepository,
            IUnitOfWork unitOfWork) {
            _postRepository = postRepository;
            _hashtagRepository = hashtagRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(AddHashtagCommand command, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(command.Name))
                throw new ArgumentException("Invalid hashtag name");

            var normalizedName = command.Name
                .Trim()
                .ToLowerInvariant();

            var post = await _postRepository
                .GetFullPostAsync(command.PostId, ct);

            if (post is null)
                throw new InvalidOperationException("Post not found");

            var hashtag = await _hashtagRepository
                .GetBySingleNameAsync(normalizedName, ct);

            if (hashtag is null)
            {
                hashtag = new Hashtag(normalizedName);
                await _hashtagRepository.AddAsync(hashtag, ct);
            }

            post.AddHashtag(hashtag);

            await _unitOfWork.SaveChangesAsync(ct);

            return Unit.Value;
        }
    }
}