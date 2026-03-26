namespace Krea.Application.Features.Favorites.GetUserFavorites {
    using Domain.Abstractions;
    using Domain.Entities;

    public sealed record GetUserFavoritesQuery(
        Guid UserId,
        int Page,
        int PageSize
    ) : IRequest<PaginatedList<Post>>;}