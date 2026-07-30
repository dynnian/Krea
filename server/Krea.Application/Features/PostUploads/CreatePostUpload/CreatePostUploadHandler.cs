namespace Krea.Application.Features.PostUploads.CreatePostUpload {
    using Abstractions;
    using Abstractions.Files;
    using Abstractions.FileStorage;
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
        private readonly IFileMetadataReader _fileMetadataReader;
        private readonly IFileCoverExtractor _fileCoverExtractor;

        public CreatePostUploadHandler(
            IPostRepository postRepository,
            IMediaRepository mediaRepository,
            IPostUploadRepository uploadRepository,
            IGenreRepository genreRepository,
            IUnitOfWork unitOfWork,
            IFileStorage fileStorage,
            IFileMetadataReader fileMetadataReader,
            IFileCoverExtractor fileCoverExtractor) {
            _postRepository = postRepository;
            _mediaRepository = mediaRepository;
            _uploadRepository = uploadRepository;
            _genreRepository = genreRepository;
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
            _fileMetadataReader = fileMetadataReader;
            _fileCoverExtractor = fileCoverExtractor;
        }

        public async Task<CreatePostUploadResponse> Handle(
            CreatePostUploadCommand command,
            CancellationToken cancellationToken) {
            FileValidator.Validate(
                command.Type,
                command.FileName,
                command.ContentType,
                command.Size);

            Post? post = await _postRepository.GetByIdAsync(command.PostId, cancellationToken);
            if (post is null)
                throw new ValidationException("Post not found.");

            ParsedUploadMetadata parsedMetadata;
            try {
                parsedMetadata = await _fileMetadataReader.ReadAsync(
                    command.FileStream,
                    command.FileName,
                    command.ContentType,
                    command.Type,
                    cancellationToken);
            }
            catch (Exception ex) {
                throw new ValidationException($"Could not extract file metadata: {ex.Message}");
            }

            ResetStream(command.FileStream);

            var media = new Media(
                command.FileName,
                command.ContentType);

            string storageFolder = GetPostStorageFolder(command.Type);

            FileStorageResult storageResult = await _fileStorage.SaveAsync(
                command.FileStream,
                media.FileName,
                command.ContentType,
                command.Size,
                cancellationToken,
                storageFolder);

            media.SetPath(storageResult.Url);

            await _mediaRepository.AddAsync(media, cancellationToken);

            var upload = new PostUpload(command.PostId, media.Id, command.IsWorkMedia);
            await _uploadRepository.AddAsync(upload, cancellationToken);

            Media? coverMedia = null;

            if (command.CoverStream is not null) {
                coverMedia = await SaveCoverFromRequestAsync(command, cancellationToken);
            }
            else {
                coverMedia = await TrySaveAutomaticCoverAsync(command, cancellationToken);
            }

            if (coverMedia is not null) {
                upload.SetCover(coverMedia.Id);
            }

            List<Genre> genres = await ResolveGenresAsync(command, cancellationToken);

            Metadata metadata = BuildMetadata(
                command,
                upload.Id,
                parsedMetadata,
                genres);

            upload.SetMetadata(metadata);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CreatePostUploadResponse {
                UploadId = upload.Id,
                MediaId = media.Id,
                Url = media.Path,
                Type = command.Type,
                CoverUrl = coverMedia?.Path,
                CoverMediaId = coverMedia?.Id
            };
        }

        private async Task<List<Genre>> ResolveGenresAsync(
            CreatePostUploadCommand command,
            CancellationToken cancellationToken) {
            var genres = new List<Genre>();

            if (command.GenreIds is null || !command.GenreIds.Any())
                return genres;

            genres = (await _genreRepository
                    .GetByIdsAsync(command.GenreIds.ToList(), cancellationToken))
                .ToList();

            if (genres.Count != command.GenreIds.Count)
                throw new ValidationException("Some genres were not found.");

            GenreType expectedType = command.Type.ToLowerInvariant() switch {
                "image" => GenreType.Image,
                "music" => GenreType.Music,
                "text" => GenreType.Text,
                _ => throw new ValidationException("Invalid type for genre validation.")
            };

            if (genres.Any(g => g.Type != expectedType))
                throw new ValidationException("One or more genres are invalid for this content type.");

            return genres;
        }

        private static Metadata BuildMetadata(
            CreatePostUploadCommand command,
            Guid uploadId,
            ParsedUploadMetadata parsedMetadata,
            List<Genre> genres) {
            ValidateParsedMetadata(command.Type, parsedMetadata);

            string title = command.Title ?? string.Empty;
            string languageCode = string.IsNullOrWhiteSpace(command.LanguageCode)
                ? "und"
                : command.LanguageCode;

            return command.Type.ToLowerInvariant() switch {
                "image" => new ImageMetadata(
                    uploadId,
                    title,
                    command.Description,
                    parsedMetadata.Width!.Value,
                    parsedMetadata.Height!.Value,
                    parsedMetadata.FileSize!.Value,
                    parsedMetadata.Format!,
                    genres),

                "music" => new MusicMetadata(
                    uploadId,
                    title,
                    command.Description,
                    parsedMetadata.BitrateKbps!.Value,
                    parsedMetadata.DurationSec!.Value,
                    genres),

                "text" => new TextMetadata(
                    uploadId,
                    title,
                    command.Description,
                    command.SortTitle,
                    command.Subtitle,
                    languageCode,
                    parsedMetadata.WordCount!.Value,
                    genres),

                _ => throw new ValidationException("Invalid metadata type.")
            };
        }

        private static void ValidateParsedMetadata(
            string type,
            ParsedUploadMetadata metadata) {
            switch (type.ToLowerInvariant()) {
                case "image":
                    if (metadata.Width is null ||
                        metadata.Height is null ||
                        metadata.FileSize is null ||
                        string.IsNullOrWhiteSpace(metadata.Format)) {
                        throw new ValidationException("Invalid image metadata.");
                    }

                    break;

                case "music":
                    if (metadata.BitrateKbps is null ||
                        metadata.DurationSec is null) {
                        throw new ValidationException("Invalid music metadata.");
                    }

                    break;

                case "text":
                    if (metadata.WordCount is null) {
                        throw new ValidationException("Invalid text metadata.");
                    }

                    break;

                default:
                    throw new ValidationException("Invalid metadata type.");
            }
        }

        private async Task<Media> SaveCoverFromRequestAsync(
            CreatePostUploadCommand command,
            CancellationToken cancellationToken) {
            ValidateCover(command);

            var coverMedia = new Media(
                command.CoverFileName!,
                command.CoverContentType!);

            FileStorageResult coverStorageResult = await _fileStorage.SaveAsync(
                command.CoverStream!,
                coverMedia.FileName,
                command.CoverContentType!,
                command.CoverSize!.Value,
                cancellationToken,
                "posts/covers");

            coverMedia.SetPath(coverStorageResult.Url);

            await _mediaRepository.AddAsync(coverMedia, cancellationToken);

            return coverMedia;
        }

        private async Task<Media?> TrySaveAutomaticCoverAsync(
            CreatePostUploadCommand command,
            CancellationToken cancellationToken) {
            ResetStream(command.FileStream);

            ExtractedCoverResult? extractedCover = await _fileCoverExtractor.TryExtractAsync(
                command.FileStream,
                command.FileName,
                command.ContentType,
                command.Type,
                cancellationToken);

            if (extractedCover is null)
                return null;

            FileValidator.Validate(
                "image",
                extractedCover.FileName,
                extractedCover.ContentType,
                extractedCover.Size);

            ResetStream(extractedCover.Stream);

            var coverMedia = new Media(
                extractedCover.FileName,
                extractedCover.ContentType);

            FileStorageResult coverStorageResult = await _fileStorage.SaveAsync(
                extractedCover.Stream,
                coverMedia.FileName,
                extractedCover.ContentType,
                extractedCover.Size,
                cancellationToken,
                "posts/covers");

            coverMedia.SetPath(coverStorageResult.Url);

            await _mediaRepository.AddAsync(coverMedia, cancellationToken);

            return coverMedia;
        }

        private static void ValidateCover(CreatePostUploadCommand command) {
            if (command.CoverStream is null ||
                string.IsNullOrWhiteSpace(command.CoverFileName) ||
                string.IsNullOrWhiteSpace(command.CoverContentType) ||
                command.CoverSize is null) {
                throw new ValidationException("Invalid cover file.");
            }

            FileValidator.Validate(
                "image",
                command.CoverFileName,
                command.CoverContentType,
                command.CoverSize.Value);

            ResetStream(command.CoverStream);
        }

        private static void ResetStream(Stream stream) {
            if (!stream.CanSeek)
                throw new ValidationException("The provided stream must support seeking.");

            stream.Position = 0;
        }

        private static string GetPostStorageFolder(string type) =>
            type.ToLowerInvariant() switch {
                "image" => "posts/images",
                "music" => "posts/music",
                "text" => "posts/text",
                _ => "posts"
            };
    }
}