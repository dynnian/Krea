namespace Krea.Application.Features.Collections.Dto {
    using Domain.ValueObjects;

    public sealed class UserCollectionDto {
        public Guid Id { get; init; }

        public string Title { get; init; } = string.Empty;

        public int ItemCount { get; init; }

        public CollectionType Type { get; init; }

        public DateTime UpdatedAt { get; init; }

        public Guid? CoverMediaId { get; init; }

        public string? CoverUrl { get; init; }
    }
}