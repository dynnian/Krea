namespace Krea.Application.Features.PostUploads.CreatePostUpload {
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
        
        public CreatePostUploadHandler(
            IPostRepository postRepository,
            IMediaRepository mediaRepository,
            IPostUploadRepository uploadRepository,
            IGenreRepository genreRepository,
            IUnitOfWork unitOfWork,
            IFileStorage fileStorage)
        {
            _postRepository = postRepository;
            _mediaRepository = mediaRepository;
            _uploadRepository = uploadRepository;
            _genreRepository = genreRepository;
            _unitOfWork = unitOfWork;
            _fileStorage = fileStorage;
        }
        
        public async Task<CreatePostUploadResponse> Handle(
            CreatePostUploadCommand command,
            CancellationToken cancellationToken)
        {
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

            // Subir archivo
            var storageResult = await _fileStorage.SaveAsync(
                command.FileStream,
                media.FileName,
                command.ContentType,
                command.Size,
                cancellationToken);
            
            media.SetPath(storageResult.Url);
            
            await _mediaRepository.AddAsync(media, cancellationToken);
            
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

            // Validar metadata antes de usarla
            ValidateMetadata(command);

            // Metadata
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
                
                _ => throw new ValidationException("Invalid metadata type.")
            };
            
            upload.SetMetadata(metadata);
            
            // Guardar todo
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return new CreatePostUploadResponse {
                UploadId = upload.Id,
                MediaId = media.Id,
                Url = media.Path,
                Type = command.Type
            };
        }
        
        private static void ValidateMetadata(CreatePostUploadCommand command) {
            switch (command.Type.ToLower())
            {
                case "image": 
                    if (command.Width is null || 
                        command.Height is null || 
                        command.FileSize is null || 
                        command.Format is null) 
                        throw new ValidationException("Invalid image metadata."); 
                    break;
                
                case "music": 
                    if (command.BitrateKbps is null || 
                        command.DurationSec is null) 
                        throw new ValidationException("Invalid music metadata."); 
                    break;
                
                case "text": 
                    if (command.WordCount is null) 
                        throw new ValidationException("Invalid text metadata."); 
                    break; 
            }
        }
    }
}
