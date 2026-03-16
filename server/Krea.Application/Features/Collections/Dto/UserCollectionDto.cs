namespace Krea.Application.Features.Collections.Dto {
    public sealed class UserCollectionDto
    {
        public Guid Id { get; init; }

        public string Title { get; init; } = string.Empty;

        public int ItemCount { get; init; }

        public DateTime UpdatedAt { get; init; }
    }
}