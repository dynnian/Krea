namespace Krea.Application.Features.PostUploads.CreatePostUpload {
    public sealed class CreatePostUploadResponse
    {
        public Guid UploadId { get; init; }
        public Guid MediaId { get; init; }
        public string Url { get; init; } = null!;
        public string Type { get; init; } = null!;
    }
}