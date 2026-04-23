namespace Krea.Application.Features.PostUploads {
    public sealed class ParsedUploadMetadata {
        public int? Width { get; init; }
        public int? Height { get; init; }
        public long? FileSize { get; init; }
        public string? Format { get; init; }
        public int? BitrateKbps { get; init; }
        public int? DurationSec { get; init; }
        public int? WordCount { get; init; }
    }
}