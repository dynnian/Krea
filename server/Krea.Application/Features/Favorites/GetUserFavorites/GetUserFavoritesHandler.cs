using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Krea.Application.Features.Favorites.Dto;
using Krea.Domain.Abstractions;
using Krea.Domain.Repositories;

namespace Krea.Application.Features.Favorites.GetUserFavorites;

public sealed class GetUserFavoritesHandler
    : IRequestHandler<GetUserFavoritesQuery, FavoritePostsResponse>
{
    private readonly IPostFavoriteRepository _repository;

    public GetUserFavoritesHandler(IPostFavoriteRepository repository)
    {
        _repository = repository;
    }

    public async Task<FavoritePostsResponse> Handle(
        GetUserFavoritesQuery request,
        CancellationToken cancellationToken)
    {
        // Obtiene PaginatedList<Post> del repositorio
        var result = await _repository.GetUserFavoritesAsync(
            request.UserId,
            request.Page,
            request.PageSize,
            cancellationToken);

        // Convierte cada Post a FavoritePostDto
        var items = result.Items
            .Select(FavoritePostDto.FromDomain)
            .ToList();

        return new FavoritePostsResponse
        {
            Items = items,
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount,
            TotalPages = result.TotalPages
        };
    }
}