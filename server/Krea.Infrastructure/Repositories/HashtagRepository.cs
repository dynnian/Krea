namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public sealed class HashtagRepository : IHashtagRepository {
        private readonly AppDbContext _context;

        public HashtagRepository(AppDbContext context) => _context = context;

        public async Task<Hashtag?> GetByIdAsync(
            Guid id,
            CancellationToken ct = default) =>
            await _context.Hashtags
                          .FirstOrDefaultAsync(h => h.Id == id, ct);

        public async Task<List<Hashtag>> GetByNamesAsync(
            IEnumerable<string> names,
            CancellationToken ct = default) =>
            await _context.Hashtags
                          .Where(h => names.Contains(h.Name))
                          .ToListAsync(ct);

        public async Task<Hashtag?> GetBySingleNameAsync(string name, CancellationToken ct) =>
            await _context.Hashtags
                          .FirstOrDefaultAsync(h => h.Name == name, ct);

        public async Task AddAsync(
            Hashtag hashtag,
            CancellationToken ct = default) =>
            await _context.Hashtags.AddAsync(hashtag, ct);

        public async Task<IReadOnlyList<Hashtag>> GetAllAsync(
            CancellationToken ct = default) =>
            await _context.Hashtags
                          .AsNoTracking()
                          .OrderBy(h => h.Name)
                          .ToListAsync(ct);
    }
}