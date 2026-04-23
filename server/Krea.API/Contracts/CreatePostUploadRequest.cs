namespace Krea.API.Contracts {
    public sealed class CreatePostUploadRequest {
        public IFormFile File { get; set; } = default!;
        public IFormFile? Cover { get; set; }

        public string Type { get; set; } = default!;
        public string? Title { get; set; }
        public string? Description { get; set; }
        public IReadOnlyCollection<Guid>? GenreIds { get; set; }

        public string? SortTitle { get; set; }
        public string? Subtitle { get; set; }
        public string? LanguageCode { get; set; }

        public bool IsWorkMedia { get; set; }
    }
}