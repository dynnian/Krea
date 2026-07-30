namespace Krea.Application.Features.Posts.Dto {
    public sealed record PostSearchItemDto(
        Guid Id,
        Guid AuthorId,
        string? AuthorName,
        string? AuthorProfilePictureUrl,
        string? Title,
        string? Content,
        string PostType,
        string? PreviewUrl,
        string? CoverUrl,
        int LikesCount,
        DateTime UploadedAt);
}