namespace Krea.Application.Features.Collections.CreateCollection {
    using Domain.Abstractions;
    using Domain.ValueObjects;

    public sealed record CreateCollectionCommand(
        Guid OwnerId,
        string Title,
        string? Description,
        CollectionType Type,
        Stream? CoverStream,
        string? CoverFileName,
        string? CoverContentType,
        long? CoverSize
    ) : IRequest<CreateCollectionResponse>;
}