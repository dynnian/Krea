namespace Krea.Application.Features.Collections.UpdateCollectionTitle {
    using Domain.Abstractions;
    using Domain.Repositories;

    public sealed class UpdateCollectionTitleCommandHandler
        : IRequestHandler<UpdateCollectionTitleCommand, UpdateCollectionTitleResponse>
    {
        private readonly ICollectionRepository _collectionRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateCollectionTitleCommandHandler(
            ICollectionRepository collectionRepository,
            IUnitOfWork unitOfWork)
        {
            _collectionRepository = collectionRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<UpdateCollectionTitleResponse> Handle(
            UpdateCollectionTitleCommand request,
            CancellationToken cancellationToken)
        {
            var collection = await _collectionRepository.GetByIdAsync(
                request.CollectionId,
                cancellationToken);

            if (collection is null)
                throw new Exception("Collection not found.");

            if (collection.OwnerId != request.CurrentUserId)
                throw new UnauthorizedAccessException("You are not the owner of this collection.");

            collection.UpdateTitle(request.NewTitle);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new UpdateCollectionTitleResponse(
                collection.Id,
                collection.Title,
                collection.UpdatedAt
            );
        }
    }
}