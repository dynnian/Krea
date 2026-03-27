namespace Krea.API.Contracts {
    public class CreatePostUploadRequest
    {
        public IFormFile File { get; set; } = null!;

        public string Type { get; set; } = null!;

        public string? Title { get; set; }
        public string? Description { get; set; }

        public string? CoverUrl { get; set; } // opcional (fallback)

        public IEnumerable<Guid>? GenreIds { get; set; }

        // TEXT
        public string? LanguageCode { get; set; }
        public string? SortTitle { get; set; }
        public string? Subtitle { get; set; }

        public bool IsWorkMedia { get; set; }
    }
}