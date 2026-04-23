namespace Krea.Application.Features.Genres.GetAllGenres {
    using Domain.Abstractions;

    public sealed record GetAllGenresCommand() : IRequest<IReadOnlyList<GenreDto>>;
}