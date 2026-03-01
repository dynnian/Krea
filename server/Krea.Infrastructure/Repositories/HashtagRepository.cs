namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public sealed class HashtagRepository : IHashtagRepository
    {
        private readonly AppDbContext _context;

        public HashtagRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Hashtag?> GetByIdAsync(
            Guid id,
            CancellationToken ct = default)
        {
            return await _context.Hashtags
                .FirstOrDefaultAsync(h => h.Id == id, ct);
        }

        public async Task<Hashtag?> GetByNameAsync(
            string name,
            CancellationToken ct = default)
        {
            return await _context.Hashtags
                .FirstOrDefaultAsync(h => h.Name == name, ct);
        }

        public async Task AddAsync(
            Hashtag hashtag,
            CancellationToken ct = default)
        {
            await _context.Hashtags.AddAsync(hashtag, ct);
        } 
    } 
}
    