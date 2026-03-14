namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public sealed class FollowRepository : IFollowRepository {
        private readonly AppDbContext _context; 
        public FollowRepository(AppDbContext context) 
        { 
            _context = context; 
        } 
        
        public async Task<bool> ExistsAsync(
            Guid sourceId, 
            Guid targetId, 
            CancellationToken cancellationToken) 
        { 
            return await _context.Set<Follow>()
                .AnyAsync(f => 
                        f.SourceId == sourceId &&
                        f.TargetId == targetId, 
                    cancellationToken); 
        }
        
        public async Task<Follow?> GetAsync(
            Guid sourceId, 
            Guid targetId, 
            CancellationToken cancellationToken) 
        { 
            return await _context.Set<Follow>()
                .FirstOrDefaultAsync(f => 
                        f.SourceId == sourceId && 
                        f.TargetId == targetId, 
                    cancellationToken); 
        }
        
        public async Task AddAsync(
            Follow follow, 
            CancellationToken cancellationToken) 
        { 
            await _context.Set<Follow>()
                .AddAsync(follow, cancellationToken); 
        }

        public Task<int> CountAsync(CancellationToken cancellationToken) =>
            _context.Set<Follow>().CountAsync(cancellationToken);

        public async Task<IReadOnlyList<Follow>> GetRecentAsync(int take, CancellationToken cancellationToken) {
            if (take <= 0)
                return Array.Empty<Follow>();

            return await _context.Set<Follow>()
                                 .AsNoTracking()
                                 .OrderByDescending(f => f.FollowedAt)
                                 .Take(take)
                                 .ToListAsync(cancellationToken);
        }
        
        public void Remove(Follow follow) 
        { 
            _context.Set<Follow>().Remove(follow); 
        }
    } 
}