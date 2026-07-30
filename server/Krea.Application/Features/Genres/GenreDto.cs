namespace Krea.Application.Features.Genres {
    using Domain.ValueObjects;

    public sealed class GenreDto {
        public Guid Id { get; init; }
        public string Name { get; init; } = default!;
        public GenreType Type { get; init; }
    }
}