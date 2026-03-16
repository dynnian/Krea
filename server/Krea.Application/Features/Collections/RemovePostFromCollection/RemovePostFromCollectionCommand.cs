namespace Krea.Application.Features.Collections.RemovePostFromCollection {
    using Domain.Abstractions;

    public sealed record RemovePostFromCollectionCommand(
        Guid CollectionId,
        Guid PostId
    ) : IRequest<Unit>;}