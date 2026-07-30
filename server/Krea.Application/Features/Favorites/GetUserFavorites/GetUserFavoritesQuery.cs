using Krea.Application.Features.Favorites.Dto;
using Krea.Domain.Abstractions;

namespace Krea.Application.Features.Favorites.GetUserFavorites {
    public sealed record GetUserFavoritesQuery(
        Guid UserId,
        int Page,
        int PageSize) : IRequest<FavoritePostsResponse>;
}