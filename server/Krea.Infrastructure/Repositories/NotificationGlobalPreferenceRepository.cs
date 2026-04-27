namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public sealed class NotificationGlobalPreferenceRepository : INotificationGlobalPreferenceRepository
    {
        private readonly AppDbContext _context;

        public NotificationGlobalPreferenceRepository(AppDbContext context) => _context = context;

        public async Task<NotificationGlobalPreference?> GetByUserAsync(
            Guid userId,
            CancellationToken cancellationToken) =>
            await _context.NotificationGlobalPreferences
                .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

        public async Task AddAsync(NotificationGlobalPreference preference, CancellationToken cancellationToken) =>
            await _context.NotificationGlobalPreferences.AddAsync(preference, cancellationToken);
    }
}