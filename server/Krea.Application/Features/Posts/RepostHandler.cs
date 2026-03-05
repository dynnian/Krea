namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class RepostHandler 
        : IRequestHandler<RepostPostCommand, Guid>
    {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RepostHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(
            RepostPostCommand command,
            CancellationToken cancellationToken)
        {
            Post? original = await _postRepository
                .GetByIdAsync(command.OriginalPostId, cancellationToken);

            if (original is null)
                throw new Exception("Post not found");

            var repost = new Post(
                command.AuthorId,
                original.Type,
                original.Title,
                original.Content ?? "",
                original.IsWork,
                true
            );

            repost.Repost(original.Id);

            await _postRepository.AddAsync(repost, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return repost.Id;
        }
    }
}