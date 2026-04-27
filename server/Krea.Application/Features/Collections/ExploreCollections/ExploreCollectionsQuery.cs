namespace Krea.Application.Features.Collections.ExploreCollections {
    using Abstractions.Payments;
    using Domain.Abstractions;
    using Dto;

    public sealed record ExploreCollectionsQuery(
        string? Search,
        string? SortBy,
        int Page = 1,
        int PageSize = 20
    ) : IRequest<PaginatedList<CollectionExploreDto>>;
}