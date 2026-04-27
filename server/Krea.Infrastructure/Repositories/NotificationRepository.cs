namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public sealed class NotificationRepository : INotificationRepository {
        private readonly AppDbContext _context;

        public NotificationRepository(AppDbContext context) => _context = context;

        public async Task AddAsync(Notification notification, CancellationToken cancellationToken) =>
            await _context.Notifications.AddAsync(notification, cancellationToken);

        public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
            await _context.Notifications
                          .AsTracking()
                          .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        public async Task<IReadOnlyList<Notification>> GetByUserAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken) =>
            await _context.Notifications
                          .AsNoTracking()
                          .Where(x => x.UserId == userId)
                          .OrderByDescending(x => x.CreatedAt)
                          .Skip((page - 1) * pageSize)
                          .Take(pageSize)
                          .ToListAsync(cancellationToken);

        public async Task<int> CountUnreadAsync(Guid userId, CancellationToken cancellationToken) =>
            await _context.Notifications
                          .AsNoTracking()
                          .CountAsync(x => x.UserId == userId && !x.IsRead, cancellationToken);

        public async Task<IReadOnlyList<Notification>> GetUnreadByUserAsync(
            Guid userId,
            CancellationToken cancellationToken) =>
            await _context.Notifications
                          .Where(x => x.UserId == userId && !x.IsRead)
                          .ToListAsync(cancellationToken);

        public Task DeleteAsync(Notification notification, CancellationToken cancellationToken) {
            _context.Notifications.Remove(notification);
            return Task.CompletedTask;
        }
    }
}