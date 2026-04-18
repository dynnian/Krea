namespace Krea.API.Tests.TestSupport;

using Application.Abstractions.FileStorage;

public sealed class InMemoryFileStorage : IFileStorage {
    public async Task<FileStorageResult> SaveAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        long size,
        CancellationToken cancellationToken,
        string? folder = null) {
        // Drain the stream to emulate real storage behavior and catch stream issues in tests.
        byte[] buffer = new byte[8192];
        while (await fileStream.ReadAsync(buffer, cancellationToken) > 0) {
        }

        string cleanFolder = string.IsNullOrWhiteSpace(folder) ? "uploads" : folder.Trim('/');
        string relativePath = $"{cleanFolder}/{fileName}";

        return new FileStorageResult {
            Url = $"https://tests.local/{relativePath}",
            FileName = fileName,
            Size = size,
            ContentType = contentType
        };
    }

    public Task DeleteAsync(string fileName, CancellationToken cancellationToken) => Task.CompletedTask;
}
