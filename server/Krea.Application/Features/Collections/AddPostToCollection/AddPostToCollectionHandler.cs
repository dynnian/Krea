namespace Krea.Application.Features.Collections.AddPostToCollection {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class AddPostToCollectionHandler
        : IRequestHandler<AddPostToCollectionCommand, AddPostToCollectionResponse> {
        private readonly ICollectionRepository _collections;
        private readonly IPostRepository _posts;
        private readonly IUnitOfWork _unitOfWork;

        public AddPostToCollectionHandler(
            ICollectionRepository collections,
            IPostRepository posts,
            IUnitOfWork unitOfWork) {
            _collections = collections;
            _posts = posts;
            _unitOfWork = unitOfWork;
        }

        public async Task<AddPostToCollectionResponse> Handle(
            AddPostToCollectionCommand request,
            CancellationToken cancellationToken) {
            Collection? collection = await _collections.GetByIdWithPostsAsync(
                request.CollectionId,
                cancellationToken);

            if (collection is null)
                throw new KeyNotFoundException("Collection not found.");

            Post? post = await _posts.GetByIdAsync(
                request.PostId,
                cancellationToken);

            if (post is null)
                throw new KeyNotFoundException("Post not found.");

            collection.AddPost(post);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new AddPostToCollectionResponse(
                collection.Id,
                post.Id,
                collection.ItemCount
            );
        }
    }
}