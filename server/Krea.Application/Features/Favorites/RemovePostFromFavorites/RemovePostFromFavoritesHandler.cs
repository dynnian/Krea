namespace Krea.Application.Features.Favorites.RemovePostFromFavorites {
    using Domain.Abstractions;
    using Domain.Repositories;

    public sealed class RemovePostFromFavoritesHandler
        : IRequestHandler<RemovePostFromFavoritesCommand, bool>
    {
        private readonly IPostFavoriteRepository _repository;

        public RemovePostFromFavoritesHandler(IPostFavoriteRepository repository)
        {
            _repository = repository;
        }

        public async Task<bool> Handle(
            RemovePostFromFavoritesCommand request,
            CancellationToken cancellationToken)
        {
            var favorite = await _repository.GetByUserAndPostAsync(
                request.UserId,
                request.PostId);

            if (favorite is null)
                return false;

            _repository.Delete(favorite);

            return true;
        }
    }
}