namespace Krea.API.Tests.TestSupport;

using Application.Abstractions.Files;

public sealed class FakeFileCoverExtractor : IFileCoverExtractor {
    public Task<ExtractedCoverResult?> TryExtractAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string type,
        CancellationToken cancellationToken) {
        return Task.FromResult<ExtractedCoverResult?>(null);
    }
}
