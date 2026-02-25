using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public class CollectionRepository : ICollectionRepository {
        private readonly AppDbContext _context;

        public CollectionRepository(AppDbContext context) => _context = context;

        public async Task<Collection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            await _context.Collections
                          .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        public async Task<Collection?> GetWithPostsAsync(Guid id, CancellationToken cancellationToken = default) =>
            await _context.Collections
                          .Include(c => c.Posts)
                          .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        public async Task<IEnumerable<Collection>> GetByOwnerAsync(Guid ownerId,
                                                                   CancellationToken cancellationToken = default) =>
            await _context.Collections
                          .Where(c => c.OwnerId == ownerId)
                          .ToListAsync(cancellationToken);

        public async Task AddAsync(Collection collection, CancellationToken cancellationToken = default) =>
            await _context.Collections.AddAsync(collection, cancellationToken);

        public Task UpdateAsync(Collection collection, CancellationToken cancellationToken = default) {
            _context.Collections.Update(collection);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Collection collection, CancellationToken cancellationToken = default) {
            _context.Collections.Remove(collection);
            return Task.CompletedTask;
        }
    }
}