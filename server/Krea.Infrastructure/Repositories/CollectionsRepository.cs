using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories;

public class CollectionsRepository : ICollectionsRepository
{
    private readonly AppDbContext _context;

    public CollectionsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Collections?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Collections?> GetWithPostsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Collections
            .Include(c => c.Posts)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Collections>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        return await _context.Collections
            .Where(c => c.OwnerId == ownerId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Collections collection, CancellationToken cancellationToken = default)
    {
        await _context.Collections.AddAsync(collection, cancellationToken);
    }

    public Task UpdateAsync(Collections collection, CancellationToken cancellationToken = default)
    {
        _context.Collections.Update(collection);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Collections collection, CancellationToken cancellationToken = default)
    {
        _context.Collections.Remove(collection);
        return Task.CompletedTask;
    }
}