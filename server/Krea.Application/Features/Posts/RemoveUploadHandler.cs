namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class RemoveUploadHandler {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RemoveUploadHandler(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork) {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(
            RemoveUploadCommand command,
            CancellationToken cancellationToken) {
            Post? post = await _postRepository
                .GetFullPostAsync(command.PostId, cancellationToken);

            if (post is null)
                throw new Exception("Post not found");

            post.RemoveUpload(command.MediaId);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}