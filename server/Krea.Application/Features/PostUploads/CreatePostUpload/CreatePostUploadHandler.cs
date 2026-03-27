namespace Krea.Application.Features.PostUploads.CreatePostUpload {
    using Abstractions.FileStorage;
    using Abstractions.Metadata;
    using Common;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using System.ComponentModel.DataAnnotations;

    public sealed class CreatePostUploadHandler
        : IRequestHandler<CreatePostUploadCommand, CreatePostUploadResponse> {
        private readonly IPostRepository _postRepository;
        private readonly IMediaRepository _mediaRepository;
        private readonly IPostUploadRepository _uploadRepository;
        private readonly IGenreRepository _genreRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorage _fileStorage;
        private readonly IMetadataExtractor _metadataExtractor;

        public CreatePostUploadHandler(
            IPostRepository postRepository,
            IMediaRepository mediaRepository,
            IPostUploadRepository uploadRepository,
            IGenreRepository genreRepository,
            IUnitOfWork unitOfWork,
            IFileStorage fileStorage,
            IMetadataExtractor metadataExtractor) {
            _postRepository = postRepository;
            _mediaRepository = mediaRepository;
            _uploadRepository = uploadRepository;
            _genreRepository = genreRepository;
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
            _metadataExtractor = metadataExtractor;
        }

        public async Task<CreatePostUploadResponse> Handle(
            CreatePostUploadCommand command,
            CancellationToken cancellationToken) {
            FileValidator.Validate(
                command.Type,
                command.FileName,
                command.ContentType,
                command.Size);

            var post = await _postRepository.GetByIdAsync(command.PostId, cancellationToken);
            if (post is null)
                throw new ValidationException("Post not found.");

            // Crear Media
            var media = new Media(
                command.FileName,
                command.ContentType
            );

            // Subir archivo principal
            var storageResult = await _fileStorage.SaveAsync(
                command.FileStream,
                media.FileName,
                command.ContentType,
                command.Size,
                cancellationToken);

            media.SetPath(storageResult.Url);

            await _mediaRepository.AddAsync(media, cancellationToken);

            // Reset stream antes de reutilizarlo
            command.FileStream.Position = 0;

            // Extraer metadata
            var extracted = await _metadataExtractor.ExtractAsync(
                command.FileStream,
                command.ContentType,
                command.FileName,
                cancellationToken);

            // Subir cover si existe
            var coverUrl = await SaveCoverIfExists(
                               extracted.CoverImage,
                               cancellationToken)
                           ?? command.CoverUrl;

            // Crear Upload
            var upload = new PostUpload(command.PostId, media.Id, command.IsWorkMedia);
            await _uploadRepository.AddAsync(upload, cancellationToken);
            
            // Géneros
            var genres = new List<Genre>();

            if (command.GenreIds is not null && command.GenreIds.Any())
            {
                genres = (await _genreRepository
                        .GetByIdsAsync(command.GenreIds, cancellationToken))
                    .ToList();

                // Validar si existe
                if (genres.Count != command.GenreIds.Count)
                    throw new ValidationException("Some genres were not found.");

                // Validar por tipo
                var expectedType = command.Type.ToLower() switch
                {
                    "image" => GenreType.Image,
                    "music" => GenreType.Music,
                    "text" => GenreType.Text,
                    _ => throw new ValidationException("Invalid type for genre validation.")
                };

                if (genres.Any(g => g.Type != expectedType))
                    throw new ValidationException("One or more genres are invalid for this content type.");
            }

            // Géneros
            var genres = new List<Genre>();

            if (command.GenreIds is not null && command.GenreIds.Any())
            {
                var genreIds = command.GenreIds.ToList();

                genres = (await _genreRepository
                        .GetByIdsAsync(genreIds, cancellationToken))
                    .ToList();

                // Validar si existe
                if (genres.Count != genreIds.Count)
                    throw new ValidationException("Some genres were not found.");

                // Validar por tipo
                var expectedType = command.Type.ToLower() switch
                {
                    "image" => GenreType.Image,
                    "music" => GenreType.Music,
                    "text" => GenreType.Text,
                    _ => throw new ValidationException("Invalid type for genre validation.")
                };

                if (genres.Any(g => g.Type != expectedType))
                    throw new ValidationException("One or more genres are invalid for this content type.");
            }

            // Metadata
            Metadata metadata = command.Type.ToLower() switch {
                "image" => new ImageMetadata(
                    upload.Id,
                    command.Title ?? extracted.Title ?? "Untitled",
                    command.Description,
                    coverUrl,
                    extracted.Width ?? throw new ValidationException("Image width not found"),
                    extracted.Height ?? throw new ValidationException("Image height not found"),
                    command.Size,
                    extracted.Format ?? command.ContentType,
                    genres),

                "music" => new MusicMetadata(
                    upload.Id,
                    command.Title ?? extracted.Title ?? "Untitled",
                    command.Description,
                    coverUrl,
                    extracted.BitrateKbps ?? throw new ValidationException("Audio bitrate not found"),
                    extracted.DurationSec ?? throw new ValidationException("Audio duration not found"),
                    genres),

                "text" => new TextMetadata(
                    upload.Id,
                    command.Title ?? extracted.Title ?? "Untitled",
                    command.Description,
                    coverUrl,
                    command.SortTitle,
                    command.Subtitle,
                    extracted.Language ?? command.LanguageCode,
                    extracted.WordCount ?? 0,
                    genres),

                _ => throw new ValidationException("Invalid metadata type.")
            };

            upload.SetMetadata(metadata);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CreatePostUploadResponse {
                UploadId = upload.Id, MediaId = media.Id, Url = media.Path, Type = command.Type
            };
        }

        private async Task<string?> SaveCoverIfExists(
            byte[]? cover,
            CancellationToken cancellationToken)
        {
            if (cover is null || cover.Length == 0)
                return null;

            var (mimeType, extension) = DetectImageFormat(cover);

            using var stream = new MemoryStream(cover);

            var fileName = $"{Guid.NewGuid()}{extension}";

            var result = await _fileStorage.SaveAsync(
                stream,
                fileName,
                mimeType,
                stream.Length,
                cancellationToken);

            return result.Url;
        }
        
        private static (string MimeType, string Extension) DetectImageFormat(byte[] bytes) {
            if (bytes.Length < 4)
                throw new ValidationException("Invalid cover image");

            // JPEG
            if (bytes[0] == 0xFF && bytes[1] == 0xD8)
                return ("image/jpeg", ".jpg");

            // PNG
            if (bytes[0] == 0x89 && bytes[1] == 0x50 &&
                bytes[2] == 0x4E && bytes[3] == 0x47)
                return ("image/png", ".png");

            // GIF
            if (bytes[0] == 0x47 && bytes[1] == 0x49 &&
                bytes[2] == 0x46)
                return ("image/gif", ".gif");

            throw new ValidationException("Unsupported cover image format");
        }
    }
}
