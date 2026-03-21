namespace Krea.API.Contracts {
    public sealed class CreatePostUploadRequest {
        public IFormFile File { get; init; } = null!;

        public string Type { get; init; } = null!;
        public string Title { get; init; } = null!;
        public string? Description { get; init; }

        public List<Guid>? GenreIds { get; init; }

        public bool IsWorkMedia { get; init; }

        // Image
        public int? Width { get; init; }
        public int? Height { get; init; }
        public long? FileSize { get; init; }
        public string? Format { get; init; }

        // Music
        public int? BitrateKbps { get; init; }
        public int? DurationSec { get; init; }

        // Text
        public string? SortTitle { get; init; }
        public string? Subtitle { get; init; }
        public string LanguageCode { get; init; }
        public int? WordCount { get; init; }
    }
}