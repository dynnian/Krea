namespace Krea.Application.Features.Collections.UploadCollectionCover {
    using Abstractions.FileStorage;
    using Common;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;
    using System.ComponentModel.DataAnnotations;

    public sealed class UploadCollectionCoverHandler
        : IRequestHandler<UploadCollectionCoverCommand, UploadCollectionCoverResponse> {
        private readonly ICollectionRepository _collectionRepository;
        private readonly IMediaRepository _mediaRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorage _fileStorage;

        public UploadCollectionCoverHandler(
            ICollectionRepository collectionRepository,
            IMediaRepository mediaRepository,
            IUnitOfWork unitOfWork,
            IFileStorage fileStorage) {
            _collectionRepository = collectionRepository;
            _mediaRepository = mediaRepository;
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
        }

        public async Task<UploadCollectionCoverResponse> Handle(
            UploadCollectionCoverCommand command,
            CancellationToken cancellationToken) {
            // Validar archivo
            FileValidator.Validate(
                "image",
                command.FileName,
                command.ContentType,
                command.Size);

            // Obtener coleccion
            Collection? collection = await _collectionRepository
                .GetByIdAsync(command.CollectionId, cancellationToken);

            if (collection is null)
                throw new ValidationException("Collection not found.");

            Media? oldMedia = null;

            // Obtener imagen anterior
            if (collection.MediaId is not null) {
                oldMedia = await _mediaRepository
                    .GetByIdAsync(collection.MediaId.Value, cancellationToken);
            }

            // Crear nuevo media
            var media = new Media(
                command.FileName,
                command.ContentType
            );

            // Subir archivo
            FileStorageResult storageResult = await _fileStorage.SaveAsync(
                command.FileStream,
                media.FileName,
                command.ContentType,
                command.Size,
                cancellationToken);

            media.SetPath(storageResult.Url);

            await _mediaRepository.AddAsync(media, cancellationToken);

            // Actualizar coleccion
            collection.UpdateImage(media);

            // Eliminar anterior (si existe)
            if (oldMedia is not null) {
                await _fileStorage.DeleteAsync(oldMedia.FileName, cancellationToken);

                _mediaRepository.Remove(oldMedia);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new UploadCollectionCoverResponse { MediaId = media.Id, Url = media.Path };
        }
    }
}