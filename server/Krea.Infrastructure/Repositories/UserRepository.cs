using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    using Domain.Abstractions;

    public sealed class UserRepository : IUserRepository {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context) => _context = context;

        public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            await _context.DomainUsers
                          .Include(u => u.ProfilePicture)
                          .Include(u => u.BannerPicture)
                          .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        public async Task<IReadOnlyList<User>> GetByIdsAsync(
            IReadOnlyCollection<Guid> ids,
            CancellationToken cancellationToken = default) {
            if (ids.Count == 0)
                return Array.Empty<User>();

            return await _context.DomainUsers
                                 .Include(u => u.ProfilePicture)
                                 .Include(u => u.BannerPicture)
                                 .Where(u => ids.Contains(u.Id))
                                 .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default) =>
            await _context.DomainUsers
                          .Include(u => u.ProfilePicture)
                          .Include(u => u.BannerPicture)
                          .ToListAsync(cancellationToken);

        public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
            _context.DomainUsers.CountAsync(cancellationToken);

        public Task<int> CountActiveSinceAsync(DateTime fromUtc, CancellationToken cancellationToken = default) =>
            _context.DomainUsers.CountAsync(u => u.LastLoginAt != null && u.LastLoginAt >= fromUtc, cancellationToken);

        public Task<int> CountSuspendedAsync(CancellationToken cancellationToken = default) =>
            _context.DomainUsers.CountAsync(u => u.IsDisabled, cancellationToken);

        public Task<int> CountBannedAsync(CancellationToken cancellationToken = default) =>
            _context.DomainUsers.CountAsync(u => u.IsBanned, cancellationToken);

        public async Task<IReadOnlyList<User>> GetRecentlyRegisteredAsync(
            int take,
            CancellationToken cancellationToken = default) {
            if (take <= 0)
                return Array.Empty<User>();

            return await _context.DomainUsers
                                 .AsNoTracking()
                                 .OrderByDescending(u => u.RegisteredAt)
                                 .Take(take)
                                 .ToListAsync(cancellationToken);
        }

        public async Task AddAsync(User user, CancellationToken cancellationToken = default) =>
            await _context.DomainUsers.AddAsync(user, cancellationToken);

        public Task UpdateAsync(User user, CancellationToken cancellationToken = default) {
            _context.DomainUsers.Update(user);
            return Task.CompletedTask;
        }

        public Task RemoveAsync(User user, CancellationToken cancellationToken = default) {
            _context.DomainUsers.Remove(user);
            return Task.CompletedTask;
        }
        
        public async Task<User?> GetByIdWithPicturesAsync(
            Guid userId,
            CancellationToken cancellationToken = default) =>
            await _context.DomainUsers
                .AsNoTracking()
                .Include(u => u.ProfilePicture)
                .Include(u => u.BannerPicture)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        
        public async Task<IReadOnlyList<User>> SearchByDisplayNameAsync(
            string query,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Array.Empty<User>();

            query = query.Trim();
            string containsPattern = $"%{query}%";

            return await _context.DomainUsers
                .AsNoTracking()
                .Include(u => u.ProfilePicture)
                .Where(u => !u.IsBanned && !u.IsDisabled)
                .Where(u => EF.Functions.ILike(u.DisplayName, containsPattern))
                .ToListAsync(cancellationToken);
        }
    }
}