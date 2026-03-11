namespace Krea.Application.Features.Collections.Dto {
    public sealed class CreateCollectionRequest
    {
        public Guid OwnerId { get; init; }

        public string Title { get; init; } = string.Empty;

        public string? Description { get; init; }
    }
}