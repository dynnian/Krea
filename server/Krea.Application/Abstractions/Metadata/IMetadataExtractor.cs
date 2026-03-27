namespace Krea.Application.Abstractions.Metadata {
    using Features.PostUploads.Dto;

    public interface IMetadataExtractor
    {
        Task<ExtractedMetadata> ExtractAsync(
            Stream fileStream,
            string contentType,
            string fileName,
            CancellationToken cancellationToken);
    }
}