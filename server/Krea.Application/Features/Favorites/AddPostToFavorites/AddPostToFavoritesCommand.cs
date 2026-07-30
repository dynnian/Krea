namespace Krea.Application.Features.Favorites.AddPostToFavorites {
    using Domain.Abstractions;

    public sealed record AddPostToFavoritesCommand(
        Guid UserId,
        Guid PostId
    ) : IRequest<bool>;
}