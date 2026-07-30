namespace Krea.Application.Features.User.UploadUserProfilePicture {
    using Abstractions.FileStorage;
    using Common;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class UploadUserProfilePictureCommandHandler
        : IRequestHandler<UploadUserProfilePictureCommand, UploadUserProfilePictureResponse> {
        private readonly IUserRepository _userRepository;
        private readonly IMediaRepository _mediaRepository;
        private readonly IFileStorage _fileStorage;
        private readonly IUnitOfWork _unitOfWork;

        public UploadUserProfilePictureCommandHandler(
            IUserRepository userRepository,
            IMediaRepository mediaRepository,
            IFileStorage fileStorage,
            IUnitOfWork unitOfWork) {
            _userRepository = userRepository;
            _mediaRepository = mediaRepository;
            _fileStorage = fileStorage;
            _unitOfWork = unitOfWork;
        }

        public async Task<UploadUserProfilePictureResponse> Handle(
            UploadUserProfilePictureCommand request,
            CancellationToken cancellationToken) {
            if (request.Content is null)
                throw new ArgumentException("File content is required.");

            User? user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user is null)
                throw new KeyNotFoundException("User was not found.");

            FileValidator.Validate(
                "image",
                request.FileName,
                request.ContentType,
                request.FileSize);

            var media = new Media(
                request.FileName,
                request.ContentType);

            if (request.Content.CanSeek)
                request.Content.Position = 0;

            string storageFileName = $"users/{request.UserId}/profile/{media.FileName}";

            FileStorageResult storageResult = await _fileStorage.SaveAsync(
                request.Content,
                storageFileName,
                request.ContentType,
                request.FileSize,
                cancellationToken);

            media.SetPath(storageResult.Url);

            await _mediaRepository.AddAsync(media, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new UploadUserProfilePictureResponse(
                media.Id,
                media.FileName,
                media.MimeType,
                media.Path,
                storageResult.Size);
        }
    }
}