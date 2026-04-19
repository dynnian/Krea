namespace Krea.Application.Features.Posts.Dto {
    public sealed class ExplorePostDto {
        public Guid Id { get; init; }
        public string Title { get; init; } = default!;
        public DateTime UploadedAt { get; init; }

        public Guid UserId { get; init; }
        public string AuthorUsername { get; init; } = string.Empty;
        
        public string Category { get; init; } = default!; // Music, Text, Image

        public IReadOnlyList<string> Genres { get; init; } = [];
        public IReadOnlyList<string> Tags { get; init; } = [];

        public string? PreviewUrl { get; init; }
    }
}