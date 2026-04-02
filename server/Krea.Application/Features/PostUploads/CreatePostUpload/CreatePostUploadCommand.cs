namespace Krea.Application.Features.PostUploads.CreatePostUpload {
    using Domain.Abstractions;

    public sealed record CreatePostUploadCommand(
        Guid PostId,
        Stream FileStream,
        string FileName,
        string ContentType,
        long Size,
        string Type,
        string? Title,
        string? Description,
        IReadOnlyCollection<Guid>? GenreIds,
        string? SortTitle,
        string? Subtitle,
        string? LanguageCode,
        bool IsWorkMedia,
        Stream? CoverStream,
        string? CoverFileName,
        string? CoverContentType,
        long? CoverSize
    ) : IRequest<CreatePostUploadResponse>;
}