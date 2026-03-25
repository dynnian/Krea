namespace Krea.Application.Features.Favorites.TogglePostFavorite {
    using Domain.Abstractions;

    public sealed record TogglePostFavoriteCommand(
        Guid UserId,
        Guid PostId
    ) : IRequest<bool>;}