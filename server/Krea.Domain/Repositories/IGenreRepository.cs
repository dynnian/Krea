namespace Krea.Domain.Repositories {
    using Entities;

    public interface IGenreRepository {
        Task<IReadOnlyList<Genre>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Genre>>
            GetByIdsAsync(IReadOnlyList<Guid> ids, CancellationToken cancellationToken = default);
    }
}