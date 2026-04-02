namespace Krea.Application.Abstractions.Files {
    public interface IFileCoverExtractor
    {
        Task<ExtractedCoverResult?> TryExtractAsync(
            Stream fileStream,
            string fileName,
            string contentType,
            string type,
            CancellationToken cancellationToken);
    }
}