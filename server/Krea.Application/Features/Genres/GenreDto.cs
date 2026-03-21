namespace Krea.Application.Features.Genres {
    public sealed class GenreDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = default!;
    }
}