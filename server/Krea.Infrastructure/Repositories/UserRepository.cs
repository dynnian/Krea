using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class UserRepository : IUserRepository {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context) => _context = context;

        public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            await _context.DomainUsers
                          .Include(u => u.ProfilePicture)
                          .Include(u => u.BannerPicture)
                          .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default) =>
            await _context.DomainUsers
                          .Include(u => u.ProfilePicture)
                          .Include(u => u.BannerPicture)
                          .ToListAsync(cancellationToken);

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
    }
}