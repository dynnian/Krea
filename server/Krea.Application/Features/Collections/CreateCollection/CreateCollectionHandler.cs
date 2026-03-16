namespace Krea.Application.Features.Collections.CreateCollection {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class CreateCollectionHandler
        : IRequestHandler<CreateCollectionCommand, CreateCollectionResponse>
    {
        private readonly ICollectionRepository _collections;
        private readonly IUnitOfWork _unitOfWork;

        public CreateCollectionHandler(
            ICollectionRepository collections,
            IUnitOfWork unitOfWork)
        {
            _collections = collections;
            _unitOfWork = unitOfWork;
        }

        public async Task<CreateCollectionResponse> Handle(
            CreateCollectionCommand request,
            CancellationToken cancellationToken)
        {
            var collection = new Collection(
                request.OwnerId,
                request.Title,
                request.Description
            );

            await _collections.AddAsync(collection, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CreateCollectionResponse(
                collection.Id,
                collection.Title,
                collection.Description,
                collection.ItemCount
            );
        }
    }
}