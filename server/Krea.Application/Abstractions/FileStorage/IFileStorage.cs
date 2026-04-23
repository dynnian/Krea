namespace Krea.Application.Abstractions.FileStorage {
    public interface IFileStorage {
        Task<FileStorageResult> SaveAsync(
            Stream fileStream,
            string fileName,
            string contentType,
            long size,
            CancellationToken cancellationToken,
            string? folder = null);

        Task DeleteAsync(string fileName, CancellationToken cancellationToken);
    }
}