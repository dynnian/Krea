namespace Krea.Application.Features.Collections.UpdateCollectionTitle {
    public sealed record UpdateCollectionTitleResponse(
        Guid Id,
        string Title,
        DateTime UpdatedAt
    );
}