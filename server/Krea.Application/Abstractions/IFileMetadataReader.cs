namespace Krea.Application.Abstractions {
    using Features.PostUploads;

    public interface IFileMetadataReader {
        Task<ParsedUploadMetadata> ReadAsync(
            Stream stream,
            string fileName,
            string contentType,
            string type,
            CancellationToken cancellationToken);
    }
}