namespace Krea.Application.Features.Posts.Dto {
    public sealed record AddUploadRequest(
        Guid MediaId,
        bool IsWorkMedia
    );}