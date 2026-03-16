namespace Krea.Application.Features.Collections.DeleteCollection {
    using Domain.Abstractions;

    public sealed record DeleteCollectionCommand(
        Guid CollectionId
    ) : IRequest<Unit>;
}