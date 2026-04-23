namespace Krea.Application.Features.Collections.DeleteCollection {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class DeleteCollectionHandler
        : IRequestHandler<DeleteCollectionCommand, Unit> {
        private readonly ICollectionRepository _collections;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteCollectionHandler(
            ICollectionRepository collections,
            IUnitOfWork unitOfWork) {
            _collections = collections;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            DeleteCollectionCommand request,
            CancellationToken cancellationToken) {
            Collection? collection = await _collections.GetByIdAsync(
                request.CollectionId,
                cancellationToken);

            if (collection is null)
                throw new Exception("Collection not found");

            _collections.Remove(collection);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new Unit();
        }
    }
}