namespace Krea.Application.Features.Collections.UploadCollectionCover {
    using Domain.Abstractions;
    using Dto;

    public sealed record UploadCollectionCoverCommand(
        Guid CollectionId,
        string FileName,
        string ContentType,
        long Size,
        Stream FileStream
    ) : IRequest<UploadCollectionCoverResponse>;
}