namespace Krea.Application.Features.Collections.GetCollectionById {
    using Abstractions.Collection;
    using Domain.Abstractions;
    using Dto;

    public sealed class GetCollectionByIdQueryHandler
        : IRequestHandler<GetCollectionByIdQuery, CollectionDetailDto?>
    {
        private readonly ICollectionQueries _queries;

        public GetCollectionByIdQueryHandler(
            ICollectionQueries queries)
        {
            _queries = queries;
        }

        public async Task<CollectionDetailDto?> Handle(
            GetCollectionByIdQuery request,
            CancellationToken cancellationToken)
        {
            return await _queries.GetByIdAsync(
                request.CollectionId,
                request.Page,
                request.PageSize,
                cancellationToken);
        }
    }
}