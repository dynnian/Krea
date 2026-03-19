namespace Krea.Application.Features.Posts.Explore {
    using Abstractions.Filter;
    using Domain.Abstractions;
    using Dto;

    public sealed class ExploreHandler 
        : IRequestHandler<ExploreQuery, PagedResult<ExplorePostDto>>
    {
        private readonly IPostReadRepository _repository;

        public ExploreHandler(IPostReadRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<ExplorePostDto>> Handle(
            ExploreQuery request,
            CancellationToken cancellationToken)
        {
            return await _repository.ExploreAsync(request, cancellationToken);
        }
    }
}