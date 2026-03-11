namespace Krea.Application.Features.Collections.RemovePostFromCollection {
    using Domain.Abstractions;
    using Domain.Repositories;

    public sealed class RemovePostFromCollectionHandler
        : IRequestHandler<RemovePostFromCollectionCommand, Unit>
    {
        private readonly ICollectionRepository _collections;
        private readonly IUnitOfWork _unitOfWork;

        public RemovePostFromCollectionHandler(
            ICollectionRepository collections,
            IUnitOfWork unitOfWork)
        {
            _collections = collections;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            RemovePostFromCollectionCommand request,
            CancellationToken cancellationToken)
        {
            var collection = await _collections.GetByIdAsync(
                request.CollectionId,
                cancellationToken);

            if (collection is null)
                throw new Exception("Collection not found");

            collection.RemovePost(request.PostId);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new Unit();
        }
    }
}