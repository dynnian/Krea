namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Dto;

    public sealed class ReplyPostHandler {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ReplyPostHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork) {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(
            ReplyPostCommand command,
            CancellationToken cancellationToken) {
            Post? original = await _postRepository
                .GetByIdAsync(command.ReplyToPostId, cancellationToken);

            if (original is null)
                throw new Exception("Post not found");

            var reply = new Post(
                command.AuthorId,
                PostType.Plain,
                command.Title,
                command.Content,
                false,
                true
            );

            reply.ReplyTo(command.ReplyToPostId);

            await _postRepository.AddAsync(reply, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return reply.Id;
        }
    }
}