namespace Krea.Application.Features.Collections.ExploreCollections {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class ExploreCollectionsHandler
        : IRequestHandler<ExploreCollectionsQuery, PaginatedList<CollectionExploreDto>> {
        private readonly ICollectionRepository _repository;

        public ExploreCollectionsHandler(ICollectionRepository repository) => _repository = repository;

        public async Task<PaginatedList<CollectionExploreDto>> Handle(
            ExploreCollectionsQuery request,
            CancellationToken cancellationToken) {
            PaginatedList<Collection> result = await _repository.ExploreAsync(
                request.Search,
                request.SortBy,
                request.Page,
                request.PageSize,
                cancellationToken);

            List<CollectionExploreDto> items = result.Items.Select(c => new CollectionExploreDto {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                ItemCount = c.ItemCount,
                Type = c.Type,
                OwnerId = c.OwnerId,
                OwnerName = c.Owner.DisplayName,
                CoverUrl = c.Image?.Path,
                CreatedAt = c.CreatedAt
            }).ToList();

            return PaginatedList<CollectionExploreDto>.FromItems(
                items,
                result.TotalCount,
                result.Page,
                result.PageSize);
        }
    }
}