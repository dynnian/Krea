namespace Krea.Application.Features.Posts.CreatePost {
    using Common;
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

            // Extraer hashtags solo desde el contenido
            var hashtagNames = HashtagParser.Extract(post.Content)
                .Select(tag => tag.Trim().ToLowerInvariant().Replace("#", ""))
                .Distinct()
                .ToList();

            if (hashtagNames.Any())
            {
                // Buscar existentes (una query)
                var existingHashtags = await _hashtagRepository
                    .GetByNamesAsync(hashtagNames, cancellationToken);

                var existingNames = existingHashtags
                    .Select(h => h.Name)
                    .ToHashSet();

                // Crear nuevos
                var newHashtags = hashtagNames
                    .Where(name => !existingNames.Contains(name))
                    .Select(name => new Hashtag(name))
                    .ToList();

                foreach (var hashtag in newHashtags)
                {
                    await _hashtagRepository.AddAsync(hashtag, cancellationToken);
                }

                // Asociar al post
                foreach (var hashtag in existingHashtags.Concat(newHashtags))
                {
                    post.AddHashtag(hashtag);
                }
            }

            await _postRepository.AddAsync(post, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CreatePostResponse(post.Id);
        }
    }
}