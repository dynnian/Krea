namespace Krea.Application.Features.Posts.CreatePost {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;

    public sealed class CreatePostHandler
        : IRequestHandler<CreatePostCommand, CreatePostResponse>
    {
        private readonly IPostRepository _postRepository;
        private readonly IHashtagRepository _hashtagRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreatePostHandler(
            IPostRepository postRepository,
            IHashtagRepository hashtagRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _hashtagRepository = hashtagRepository;
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

            if (request.Hashtags is not null && request.Hashtags.Any())
            {
                foreach (var tag in request.Hashtags)
                {
                    if (string.IsNullOrWhiteSpace(tag))
                        continue;

                    var normalized = tag
                        .Trim()
                        .ToLowerInvariant()
                        .Replace("#", ""); // opcional

                    var hashtag = await _hashtagRepository
                        .GetByNameAsync(normalized, cancellationToken);

                    if (hashtag is null)
                    {
                        hashtag = new Hashtag(normalized);
                        await _hashtagRepository.AddAsync(hashtag, cancellationToken);
                    }

                    post.AddHashtag(hashtag);
                }
            }

            await _postRepository.AddAsync(post, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CreatePostResponse(post.Id);
        }
    }
}