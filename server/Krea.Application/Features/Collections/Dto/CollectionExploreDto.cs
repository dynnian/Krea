namespace Krea.Application.Features.Collections.Dto {
    using Domain.ValueObjects;

    public sealed class CollectionExploreDto {
        public Guid Id { get; init; }
        public string Title { get; init; } = default!;
        public string? Description { get; init; }
        public int ItemCount { get; init; }
        public CollectionType Type { get; init; }
        public Guid OwnerId { get; init; }
        public string OwnerName { get; init; } = string.Empty;
        public string? CoverUrl { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}