namespace Krea.Application.Features.PostUploads.CreatePostUpload {
    public sealed class CreatePostUploadResponse
    {
        public Guid UploadId { get; init; }
        public Guid MediaId { get; init; }
        public string Url { get; init; } = default!;
        public string Type { get; init; } = default!;
        public string? CoverUrl { get; init; }
        public Guid? CoverMediaId { get; init; }
    }
}