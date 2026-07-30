using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    using Domain.Abstractions;

    public class CollectionRepository : ICollectionRepository {
        private readonly AppDbContext _context;

        public CollectionRepository(AppDbContext context) => _context = context;

        public async Task<Collection?> GetByIdAsync(
            Guid id,
            CancellationToken ct = default) =>
            await _context.Collections
                          .FirstOrDefaultAsync(c => c.Id == id, ct);

        public async Task<Collection?> GetByIdWithPostsAsync(
            Guid id,
            CancellationToken ct = default) =>
            await _context.Collections
                          .Include(c => c.Posts)
                          .FirstOrDefaultAsync(c => c.Id == id, ct);

        public async Task<IReadOnlyList<Collection>> GetByOwnerAsync(
            Guid ownerId,
            CancellationToken ct = default) =>
            await _context.Collections
                          .AsNoTracking()
                          .Where(c => c.OwnerId == ownerId)
                          .OrderByDescending(c => c.CreatedAt)
                          .ToListAsync(ct);

        public async Task AddAsync(
            Collection collection,
            CancellationToken ct = default) =>
            await _context.Collections.AddAsync(collection, ct);

        public void Remove(Collection collection) => _context.Collections.Remove(collection);

        public async Task<PaginatedList<Collection>> ExploreAsync(
            string? search,
            string? sortBy,
            int page,
            int pageSize,
            CancellationToken ct = default) {
            IQueryable<Collection> query = _context.Collections
                                                   .AsNoTracking()
                                                   .Include(c => c.Owner)
                                                   .Include(c => c.Image);

            if (!string.IsNullOrWhiteSpace(search)) {
                string term = search.Trim().ToLower();

                query = query.Where(c =>
                    c.Title.ToLower().Contains(term) ||
                    (c.Description != null && c.Description.ToLower().Contains(term)));
            }

            query = sortBy?.ToLowerInvariant() switch {
                "oldest" => query.OrderBy(c => c.CreatedAt),
                "newest" => query.OrderByDescending(c => c.CreatedAt),
                _ => query.OrderByDescending(c => c.CreatedAt)
            };

            return await PaginatedList<Collection>.CreateAsync(
                query,
                page,
                pageSize,
                ct);
        }
    }
}