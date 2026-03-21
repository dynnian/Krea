namespace Krea.Application.Features.PostUploads.CreatePostUpload {
    using Domain.Abstractions;

    public sealed record CreatePostUploadCommand(
        Guid PostId,
        Stream FileStream,
        string FileName,
        string ContentType,
        long Size,
        string Type,
        string Title,
        string? Description,
        List<Guid>? GenreIds,
        int? Width,
        int? Height,
        long? FileSize,
        string? Format,
        int? BitrateKbps,
        int? DurationSec,
        int? WordCount,
        string? LanguageCode,
        string? SortTitle,
        string? Subtitle,
        bool IsWorkMedia
    ) : IRequest<CreatePostUploadResponse>;}