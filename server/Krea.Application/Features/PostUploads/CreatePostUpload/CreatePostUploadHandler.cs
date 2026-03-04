namespace Krea.Application.Features.PostUploads.CreatePostUpload {
    using Abstractions.FileStorage;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class CreatePostUploadHandler
        : IRequestHandler<CreatePostUploadCommand, CreatePostUploadResponse> {
        private readonly IPostRepository _postRepository;
        private readonly IMediaRepository _mediaRepository;
        private readonly IPostUploadRepository _uploadRepository;
        private readonly IGenreRepository _genreRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorage _fileStorage;

        public CreatePostUploadHandler(
            IPostRepository postRepository,
            IMediaRepository mediaRepository,
            IPostUploadRepository uploadRepository,
            IGenreRepository genreRepository,
            IUnitOfWork unitOfWork,
            IFileStorage fileStorage) {
            _postRepository = postRepository;
            _mediaRepository = mediaRepository;
            _uploadRepository = uploadRepository;
            _genreRepository = genreRepository;
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
        }

        public async Task<CreatePostUploadResponse> Handle(
            CreatePostUploadCommand command,
            CancellationToken cancellationToken) {
            // Validar post
            var post = await _postRepository.GetByIdAsync(command.PostId, cancellationToken);
            if (post is null)
                throw new Exception("Post not found.");

            // Crear Media primero
            var media = new Media(
                command.FileName,
                command.ContentType
            );

            // Guardar archivo usando el FileName generado por Media
            var storageResult = await _fileStorage.SaveAsync(
                command.FileStream,
                media.FileName,
                command.ContentType,
                command.Size,
                cancellationToken);

            // Asignar path real
            media.SetPath(storageResult.Url);

            // Persistir
            await _mediaRepository.AddAsync(media, cancellationToken);

            // Crear Upload
            var upload = new PostUpload(command.PostId, media.Id, command.IsWorkMedia);
            await _uploadRepository.AddAsync(upload, cancellationToken);

            // Obtener géneros
            var genres = command.GenreIds is not null && command.GenreIds.Any()
                ? await _genreRepository.GetByIdsAsync(command.GenreIds, cancellationToken)
                : new List<Genre>();

            // Crear Metadata
            Metadata metadata = command.Type.ToLower() switch {
                "image" => new ImageMetadata(
                    upload.Id,
                    command.Title,
                    command.Description,
                    command.Width!.Value,
                    command.Height!.Value,
                    command.FileSize!.Value,
                    command.Format!,
                    genres),

                "music" => new MusicMetadata(
                    upload.Id,
                    command.Title,
                    command.Description,
                    command.BitrateKbps!.Value,
                    command.DurationSec!.Value,
                    genres),

                "text" => new TextMetadata(
                    upload.Id,
                    command.Title,
                    command.Description,
                    command.SortTitle,
                    command.Subtitle,
                    command.LanguageCode,
                    command.WordCount!.Value,
                    genres),

                _ => throw new Exception("Invalid metadata type.")
            };

            upload.SetMetadata(metadata);

            // Guardar todo
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CreatePostUploadResponse {
                UploadId = upload.Id, MediaId = media.Id, Url = media.Path, Type = command.Type
            };
        }
    }
}
