namespace Krea.Application.Features.Collections.GetCollectionById {
    using Domain.Abstractions;
    using Dto;

    public sealed record GetCollectionByIdQuery(
        Guid CollectionId,
        int Page,
        int PageSize
    ) : IRequest<CollectionDetailDto?>;
}