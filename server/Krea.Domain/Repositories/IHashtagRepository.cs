namespace Krea.Domain.Repositories {
    using Entities;

    public interface IHashtagRepository
    {
        Task<Hashtag?> GetByIdAsync(Guid id, CancellationToken ct = default);

        Task<Hashtag?> GetByNameAsync(string name, CancellationToken ct = default);

        Task AddAsync(Hashtag hashtag, CancellationToken ct = default);
    }
}