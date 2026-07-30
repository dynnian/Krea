namespace Krea.Application.Features.Genres {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class AssignGenresToUploadHandler
        : IRequestHandler<AssignGenresToUploadCommand, Unit> {
        private readonly IPostUploadRepository _uploadRepository;
        private readonly IGenreRepository _genreRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AssignGenresToUploadHandler(
            IPostUploadRepository uploadRepository,
            IGenreRepository genreRepository,
            IUnitOfWork unitOfWork) {
            _uploadRepository = uploadRepository;
            _genreRepository = genreRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            AssignGenresToUploadCommand request,
            CancellationToken cancellationToken) {
            // Primero obtener upload con metadata
            PostUpload? upload = await _uploadRepository
                .GetByIdWithMetadataAsync(request.UploadId, cancellationToken);

            if (upload is null)
                throw new Exception("Upload not found");

            if (upload.Metadata is null)
                throw new Exception("Metadata not found");

            // Luego obtener generos
            IReadOnlyList<Genre> genres = await _genreRepository
                .GetByIdsAsync(request.GenreIds, cancellationToken);

            if (genres.Count != request.GenreIds.Count)
                throw new Exception("Some genres were not found");

            // Se valida por Type)
            // Ejemplo: validar que coincida con el tipo del post
            // (si tienes lógica para eso)

            // Se asigna los generos
            foreach (Genre genre in genres) {
                upload.Metadata.AddGenre(genre);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}