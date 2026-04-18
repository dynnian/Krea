namespace Krea.Application.Features.Collections.Dto {
    public sealed class CollectionDto {
        public Guid Id { get; init; }

        public string Title { get; init; } = default!;

        public string? Description { get; init; }

        public Guid OwnerId { get; init; }

        public string? ImageUrl { get; init; }

        public int ItemCount { get; init; }

        public DateTime CreatedAt { get; init; }
    }
}