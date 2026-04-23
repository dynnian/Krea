namespace Krea.Application.Features.Genres.GetAllGenres {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetAllGenresHandler
        : IRequestHandler<GetAllGenresCommand, IReadOnlyList<GenreDto>>
    {
        private readonly IGenreRepository _genreRepository;

        public GetAllGenresHandler(IGenreRepository genreRepository)
        {
            _genreRepository = genreRepository;
        }

        public async Task<IReadOnlyList<GenreDto>> Handle(
            GetAllGenresCommand request,
            CancellationToken cancellationToken)
        {
            IReadOnlyList<Genre> genres = await _genreRepository
                .GetAllAsync(cancellationToken);

            return genres
                .Select(g => new GenreDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    Type = g.Type
                })
                .ToList();
        }
    }
}