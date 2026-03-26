namespace Krea.Application.Features.Favorites.GetUserFavorites {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetUserFavoritesHandler
        : IRequestHandler<GetUserFavoritesQuery, PaginatedList<Post>>
    {
        private readonly IPostFavoriteRepository _repository;

        public GetUserFavoritesHandler(IPostFavoriteRepository repository)
        {
            _repository = repository;
        }

        public async Task<PaginatedList<Post>> Handle(
            GetUserFavoritesQuery request,
            CancellationToken cancellationToken)
        {
            return await _repository.GetUserFavoritesAsync(
                request.UserId,
                request.Page,
                request.PageSize,
                cancellationToken);
        }
    }
}