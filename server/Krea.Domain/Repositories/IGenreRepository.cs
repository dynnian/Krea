namespace Krea.Domain.Repositories {
    using Entities;

    public interface IGenreRepository {
        Task<List<Genre>> GetByIdsAsync(List<Guid> ids, CancellationToken cancellationToken = default);
    }
}