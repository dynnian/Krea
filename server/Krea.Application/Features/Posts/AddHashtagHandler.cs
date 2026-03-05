namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class AddHashtagHandler {
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

        public async Task Handle(AddHashtagCommand command, CancellationToken ct) {
            var post = await _postRepository
                .GetFullPostAsync(command.PostId, ct);

            if (post is null)
                throw new InvalidOperationException("Post not found");

            var normalizedName = command.Name.Trim().ToLower();

            if (string.IsNullOrWhiteSpace(normalizedName))
                throw new ArgumentException("Invalid hashtag name");

            var hashtag = await _hashtagRepository
                .GetByNameAsync(normalizedName, ct);

            if (hashtag is null) {
                hashtag = new Hashtag(normalizedName);
                await _hashtagRepository.AddAsync(hashtag, ct);
            }

            post.AddHashtag(hashtag); 
            await _unitOfWork.SaveChangesAsync(ct);
        }
    }
}