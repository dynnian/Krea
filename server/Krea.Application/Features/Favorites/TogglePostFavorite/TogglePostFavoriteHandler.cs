namespace Krea.Application.Features.Favorites.TogglePostFavorite {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class TogglePostFavoriteHandler
        : IRequestHandler<TogglePostFavoriteCommand, bool> {
        private readonly IPostFavoriteRepository _repository;

        public TogglePostFavoriteHandler(IPostFavoriteRepository repository) => _repository = repository;

        public async Task<bool> Handle(
            TogglePostFavoriteCommand request,
            CancellationToken cancellationToken) {
            bool exists = await _repository.ExistsAsync(
                request.UserId,
                request.PostId);

            if (exists) {
                PostFavorite? favorite = await _repository.GetByUserAndPostAsync(
                    request.UserId,
                    request.PostId);

                if (favorite is not null)
                    _repository.Delete(favorite);

                return false; // No es favorito
            }

            var newFavorite = new PostFavorite(
                request.UserId,
                request.PostId);

            await _repository.AddAsync(newFavorite, cancellationToken);

            return true; // Si es favorito
        }
    }
}