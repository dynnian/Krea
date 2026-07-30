namespace Krea.Application.Features.Favorites.AddPostToFavorites {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class AddPostToFavoritesHandler
        : IRequestHandler<AddPostToFavoritesCommand, bool> {
        private readonly IPostFavoriteRepository _repository;

        public AddPostToFavoritesHandler(IPostFavoriteRepository repository) => _repository = repository;

        public async Task<bool> Handle(
            AddPostToFavoritesCommand request,
            CancellationToken cancellationToken) {
            bool exists = await _repository.ExistsAsync(
                request.UserId,
                request.PostId);

            if (exists)
                return false;

            var favorite = new PostFavorite(
                request.UserId,
                request.PostId);

            await _repository.AddAsync(favorite, cancellationToken);

            return true;
        }
    }
}