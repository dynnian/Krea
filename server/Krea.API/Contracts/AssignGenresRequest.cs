namespace Krea.API.Contracts {
    public sealed class AssignGenresRequest {
        public List<Guid> GenreIds { get; set; } = new();
    }
}