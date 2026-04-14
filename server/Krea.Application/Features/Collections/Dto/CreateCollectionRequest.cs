namespace Krea.Application.Features.Collections.Dto {
    using Domain.ValueObjects;
    using Microsoft.AspNetCore.Http;

    public sealed class CreateCollectionRequest
    {
        public string Title { get; init; } = string.Empty;
        public string? Description { get; init; }
        public CollectionType Type { get; init; }
        public IFormFile? Cover { get; init; }
    }
}