namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.EntityFrameworkCore;

    public sealed class NotificationPreferenceRepository : INotificationPreferenceRepository {
        private readonly AppDbContext _context;

        public NotificationPreferenceRepository(AppDbContext context) => _context = context;

        public async Task<NotificationPreference?> GetByUserAndTypeAsync(
            Guid userId,
            NotificationType type,
            CancellationToken cancellationToken) =>
            await _context.NotificationPreferences
                          .FirstOrDefaultAsync(x => x.UserId == userId && x.Type == type, cancellationToken);

        public async Task<IReadOnlyList<NotificationPreference>> GetByUserAsync(
            Guid userId,
            CancellationToken cancellationToken) =>
            await _context.NotificationPreferences
                          .AsNoTracking()
                          .Where(x => x.UserId == userId)
                          .OrderBy(x => x.Type)
                          .ToListAsync(cancellationToken);

        public async Task AddAsync(NotificationPreference preference, CancellationToken cancellationToken) =>
            await _context.NotificationPreferences.AddAsync(preference, cancellationToken);
    }
}