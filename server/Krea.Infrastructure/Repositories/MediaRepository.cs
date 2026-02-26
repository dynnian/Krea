using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories;

public sealed class MediaRepository : IMediaRepository
{
    private readonly AppDbContext _context;

    public MediaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Media?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Media
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<Media?> GetByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        return await _context.Media
            .FirstOrDefaultAsync(m => m.FileName == fileName, cancellationToken);
    }

    public async Task<bool> ExistsByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        return await _context.Media
            .AnyAsync(m => m.FileName == fileName, cancellationToken);
    }

    public async Task AddAsync(Media media, CancellationToken cancellationToken = default)
    {
        await _context.Media.AddAsync(media, cancellationToken);
    }

    public void Update(Media media)
    {
        _context.Media.Update(media);
    }

    public void Remove(Media media)
    {
        _context.Media.Remove(media);
    }
    
    public Task DeleteAsync(Media media, CancellationToken cancellationToken = default)
    {
        _context.Media.Remove(media);
        return Task.CompletedTask;
    }
}