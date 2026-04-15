namespace Krea.Application.Features.Collections.UpdateCollectionTitle {
    using Domain.Abstractions;

    public sealed record UpdateCollectionTitleCommand(
        Guid CollectionId,
        Guid CurrentUserId,
        string NewTitle
    ) : IRequest<UpdateCollectionTitleResponse>;
}