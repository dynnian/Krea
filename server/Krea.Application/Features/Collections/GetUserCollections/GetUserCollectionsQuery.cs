namespace Krea.Application.Features.Collections.GetUserCollections {
    using Domain.Abstractions;
    using Dto;

    public sealed record GetUserCollectionsQuery(
        Guid UserId
    ) : IRequest<IReadOnlyList<UserCollectionDto>>;
}