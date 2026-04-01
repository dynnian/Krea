namespace Krea.Application.Abstractions.Files {
    public sealed class ExtractedCoverResult
    {
        public Stream Stream { get; init; } = default!;
        public string FileName { get; init; } = default!;
        public string ContentType { get; init; } = default!;
        public long Size { get; init; }
    }
}