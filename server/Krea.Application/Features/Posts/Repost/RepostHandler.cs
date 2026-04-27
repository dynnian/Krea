namespace Krea.Application.Features.Posts.Repost {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class RepostHandler
        : IRequestHandler<RepostPostCommand, Guid> {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RepostHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork) {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(
            RepostPostCommand command,
            CancellationToken cancellationToken) {
            Post? original = await _postRepository
                .GetByIdAsync(command.OriginalPostId, cancellationToken);

            if (original is null)
                throw new InvalidOperationException("Original post not found");

            if (original.IsDeleted)
                throw new InvalidOperationException("Cannot repost a deleted post");

            if (original.RepostOfId.HasValue)
                throw new InvalidOperationException("Cannot repost a repost");

            Guid repostTargetId = original.RepostOfId ?? original.Id;

            Post? existingRepost = await _postRepository.GetRepostByUserAndTargetAsync(
                repostTargetId,
                command.AuthorId,
                cancellationToken);

            if (existingRepost is not null) {
                existingRepost.Delete();
                await _postRepository.UpdateAsync(existingRepost, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return existingRepost.Id;
            }

            var repost = new Post(
                command.AuthorId,
                original.Type,
                original.Title,
                original.Content ?? string.Empty,
                original.IsWork,
                original.IsLocal
            );

            repost.Repost(repostTargetId);

            await _postRepository.AddAsync(repost, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return repost.Id;
        }
    }
}