namespace Krea.Application.Features.Collections.AddPostToCollection {
    public sealed record AddPostToCollectionResponse(
        Guid CollectionId,
        Guid PostId,
        int ItemCount
    );
}