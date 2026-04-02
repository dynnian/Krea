namespace Krea.Application.Features.Collections.CreateCollection {
    using Domain.ValueObjects;

    public sealed record CreateCollectionResponse(
        Guid Id,
        string Title,
        string? Description,
        int ItemCount,
        CollectionType Type
    );}