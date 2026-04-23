namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public sealed class FollowRepository : IFollowRepository {
        private readonly AppDbContext _context;

        public FollowRepository(AppDbContext context) => _context = context;

        public async Task<bool> ExistsAsync(
            Guid sourceId,
            Guid targetId,
            CancellationToken cancellationToken) =>
            await _context.Set<Follow>()
                          .AnyAsync(f =>
                                  f.SourceId == sourceId &&
                                  f.TargetId == targetId,
                              cancellationToken);

        public async Task<Follow?> GetAsync(
            Guid sourceId,
            Guid targetId,
            CancellationToken cancellationToken) =>
            await _context.Set<Follow>()
                          .FirstOrDefaultAsync(f =>
                                  f.SourceId == sourceId &&
                                  f.TargetId == targetId,
                              cancellationToken);

        public async Task AddAsync(
            Follow follow,
            CancellationToken cancellationToken) =>
            await _context.Set<Follow>()
                          .AddAsync(follow, cancellationToken);

        public Task<int> CountAsync(CancellationToken cancellationToken) =>
            _context.Set<Follow>().CountAsync(cancellationToken);

        public async Task<IReadOnlyList<Follow>> GetRecentAsync(
            int take,
            CancellationToken cancellationToken) {
            if (take <= 0)
                return Array.Empty<Follow>();

            return await _context.Set<Follow>()
                                 .AsNoTracking()
                                 .OrderByDescending(f => f.FollowedAt)
                                 .Take(take)
                                 .ToListAsync(cancellationToken);
        }

        public void Remove(Follow follow) => _context.Set<Follow>().Remove(follow);

        public async Task<int> GetFollowersCountAsync(
            Guid userId,
            CancellationToken cancellationToken) =>
            await _context.Set<Follow>()
                          .AsNoTracking()
                          .CountAsync(f => f.TargetId == userId, cancellationToken);

        public async Task<int> GetFollowingCountAsync(
            Guid userId,
            CancellationToken cancellationToken) =>
            await _context.Set<Follow>()
                          .AsNoTracking()
                          .CountAsync(f => f.SourceId == userId, cancellationToken);

        public async Task<IReadOnlyList<Follow>> GetFollowersPageAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken) {
            if (page <= 0 || pageSize <= 0)
                return Array.Empty<Follow>();

            return await _context.Set<Follow>()
                                 .AsNoTracking()
                                 .Where(f => f.TargetId == userId)
                                 .Include(f => f.Source)
                                 .ThenInclude(u => u.ProfilePicture)
                                 .OrderByDescending(f => f.FollowedAt)
                                 .Skip((page - 1) * pageSize)
                                 .Take(pageSize)
                                 .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<Follow>> GetFollowingPageAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken) {
            if (page <= 0 || pageSize <= 0)
                return Array.Empty<Follow>();

            return await _context.Set<Follow>()
                                 .AsNoTracking()
                                 .Where(f => f.SourceId == userId)
                                 .Include(f => f.Target)
                                 .ThenInclude(u => u.ProfilePicture)
                                 .OrderByDescending(f => f.FollowedAt)
                                 .Skip((page - 1) * pageSize)
                                 .Take(pageSize)
                                 .ToListAsync(cancellationToken);
        }

        public async Task<HashSet<Guid>> GetFollowedTargetIdsAsync(
            Guid sourceId,
            IReadOnlyCollection<Guid> candidateTargetIds,
            CancellationToken cancellationToken) {
            if (candidateTargetIds.Count == 0)
                return new HashSet<Guid>();

            List<Guid> followedIds = await _context.Set<Follow>()
                                                   .AsNoTracking()
                                                   .Where(f =>
                                                       f.SourceId == sourceId &&
                                                       candidateTargetIds.Contains(f.TargetId))
                                                   .Select(f => f.TargetId)
                                                   .ToListAsync(cancellationToken);

            return followedIds.ToHashSet();
        }
    }
}