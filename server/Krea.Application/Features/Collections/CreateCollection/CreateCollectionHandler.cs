namespace Krea.Application.Features.Collections.CreateCollection {
    using Abstractions.FileStorage;
    using Common;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class CreateCollectionHandler
        : IRequestHandler<CreateCollectionCommand, CreateCollectionResponse> {
        private readonly ICollectionRepository _collections;
        private readonly IMediaRepository _mediaRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorage _fileStorage;

        public CreateCollectionHandler(
            ICollectionRepository collections,
            IMediaRepository mediaRepository,
            IUnitOfWork unitOfWork,
            IFileStorage fileStorage) {
            _collections = collections;
            _mediaRepository = mediaRepository;
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
        }

        public async Task<CreateCollectionResponse> Handle(
            CreateCollectionCommand request,
            CancellationToken cancellationToken) {
            var collection = new Collection(
                request.OwnerId,
                request.Title,
                request.Description,
                request.Type
            );

            await _collections.AddAsync(collection, cancellationToken);

            Media? media = null;

            bool hasCover =
                request.CoverStream is not null &&
                !string.IsNullOrWhiteSpace(request.CoverFileName) &&
                !string.IsNullOrWhiteSpace(request.CoverContentType) &&
                request.CoverSize.HasValue &&
                request.CoverSize.Value > 0;

            if (hasCover) {
                FileValidator.Validate(
                    "image",
                    request.CoverFileName!,
                    request.CoverContentType!,
                    request.CoverSize!.Value);

                media = new Media(
                    request.CoverFileName!,
                    request.CoverContentType!);

                FileStorageResult storageResult = await _fileStorage.SaveAsync(
                    request.CoverStream!,
                    media.FileName,
                    request.CoverContentType!,
                    request.CoverSize.Value,
                    cancellationToken);

                media.SetPath(storageResult.Url);

                await _mediaRepository.AddAsync(media, cancellationToken);

                collection.UpdateImage(media);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CreateCollectionResponse(
                collection.Id,
                collection.Title,
                collection.Description,
                collection.ItemCount,
                collection.Type,
                media?.Id,
                media?.Path
            );
        }
    }
}