namespace Krea.Application.Features.Favorites.RemovePostFromFavorites {
    using Domain.Abstractions;

    public sealed record RemovePostFromFavoritesCommand(
        Guid UserId,
        Guid PostId
    ) : IRequest<bool>;
}