namespace Krea.Application.Abstractions.FileStorage {
    public sealed class FileStorageResult
    {
        public string Url { get; init; } = null!;
        public string FileName { get; init; } = null!;
        public string ContentType { get; init; } = null!;
        public long Size { get; init; }
    }
}