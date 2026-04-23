namespace Krea.Application.Features.Collections.Dto {
    using Domain.ValueObjects;

    public sealed class CollectionDetailDto {
        public Guid Id { get; init; }

        public string Title { get; init; } = string.Empty;

        public string? Description { get; init; }

        public Guid OwnerId { get; init; }

        public int ItemCount { get; init; }

        public CollectionType Type { get; init; }

        public DateTime CreatedAt { get; init; }

        public Guid? CoverMediaId { get; init; }

        public string? CoverUrl { get; init; }

        public IReadOnlyList<CollectionPostDto> Posts { get; init; } = [];
    }
}