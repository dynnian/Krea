namespace Krea.Application.Abstractions.Collection {
    using Features.Collections.Dto;

    public interface ICollectionQueries {
        Task<CollectionDetailDto?> GetByIdAsync(
            Guid collectionId,
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        Task<IReadOnlyList<UserCollectionDto>> GetUserCollectionsAsync(
            Guid userId,
            CancellationToken cancellationToken);
    }
}