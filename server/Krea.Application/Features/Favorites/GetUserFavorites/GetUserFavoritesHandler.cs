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
        var result = await _repository.GetUserFavoritesAsync(
            request.UserId,
            request.Page,
            request.PageSize,
            cancellationToken);

        var items = result.Items
            .Select(post => FavoritePostDto.FromDomain(post, request.UserId))
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