namespace Krea.Application.Features.Collections.AddPostToCollection {
    using Domain.Abstractions;

    public sealed record AddPostToCollectionCommand(
        Guid CollectionId,
        Guid PostId
    ) : IRequest<AddPostToCollectionResponse>;
}