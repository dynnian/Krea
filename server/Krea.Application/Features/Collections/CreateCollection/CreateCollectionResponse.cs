namespace Krea.Application.Features.Collections.CreateCollection {
    public sealed record CreateCollectionResponse(
        Guid Id,
        string Title,
        string? Description,
        int ItemCount
    );}