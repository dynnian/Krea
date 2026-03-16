namespace Krea.Application.Features.Collections.Dto {
    public sealed class CollectionPostDto
    {
        public Guid Id { get; init; }

        public string Title { get; init; } = default!;

        public Guid AuthorId { get; init; }

        public DateTime UploadedAt { get; init; }

        public string? MediaPreviewUrl { get; init; }
    }
}