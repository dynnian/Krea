namespace Krea.Application.Features.Collections.UpdateCollectionTitle {
    public sealed record UpdateCollectionTitleRequest {
        public string Title { get; init; } = string.Empty;
    }
}