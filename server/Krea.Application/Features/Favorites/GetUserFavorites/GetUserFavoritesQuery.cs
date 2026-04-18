using Krea.Domain.Abstractions;
using Krea.Application.Features.Favorites.Dto;

namespace Krea.Application.Features.Favorites.GetUserFavorites;

public sealed record GetUserFavoritesQuery(
    Guid UserId,
    int Page,
    int PageSize) : IRequest<FavoritePostsResponse>;