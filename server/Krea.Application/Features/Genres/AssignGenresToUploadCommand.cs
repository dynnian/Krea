namespace Krea.Application.Features.Genres {
    using Domain.Abstractions;

    public sealed record AssignGenresToUploadCommand(
        Guid UploadId,
        List<Guid> GenreIds
    ) : IRequest<Unit>;}