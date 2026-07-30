namespace Krea.Application.Features.Collections.Dto {
    public sealed class UploadCollectionCoverResponse {
        public Guid MediaId { get; set; }
        public string Url { get; set; } = default!;
    }
}