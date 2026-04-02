namespace Krea.Domain.Repositories {
    using Entities;

    public interface IHashtagRepository
    {
        Task<Hashtag?> GetByIdAsync(Guid id, CancellationToken ct = default);
        
        Task<Hashtag?> GetBySingleNameAsync(string name, CancellationToken ct);

        Task<List<Hashtag>> GetByNamesAsync(IEnumerable<string> names, CancellationToken ct = default);
        
        Task AddAsync(Hashtag hashtag, CancellationToken ct = default);
        
        Task<IReadOnlyList<Hashtag>> GetAllAsync(CancellationToken ct = default);
    }
}