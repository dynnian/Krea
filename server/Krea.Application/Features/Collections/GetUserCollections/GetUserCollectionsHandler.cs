namespace Krea.Application.Features.Collections.GetUserCollections {
    using Abstractions.Collection;
    using Domain.Abstractions;
    using Dto;

    public sealed class GetUserCollectionsHandler
        : IRequestHandler<GetUserCollectionsQuery, IReadOnlyList<UserCollectionDto>> {
        private readonly ICollectionQueries _queries;

        public GetUserCollectionsHandler(
            ICollectionQueries queries) =>
            _queries = queries;

        public async Task<IReadOnlyList<UserCollectionDto>> Handle(
            GetUserCollectionsQuery request,
            CancellationToken cancellationToken) =>
            await _queries.GetUserCollectionsAsync(
                request.UserId,
                cancellationToken);
    }
}