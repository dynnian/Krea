namespace Krea.Infrastructure.Repositories {
    using Domain.Entities;
    using Domain.Repositories;
    using Data;
    using Microsoft.EntityFrameworkCore;

    public class RefreshTokenRepository(AppDbContext context) : IRefreshTokenRepository {
        
        public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default) {
            return await context.Set<RefreshToken>()
                .FirstOrDefaultAsync(rt => rt.Token == token, cancellationToken);
        }

        public void Add(RefreshToken refreshToken) => context.Set<RefreshToken>().Add(refreshToken);

        public void Update(RefreshToken refreshToken) => context.Set<RefreshToken>().Update(refreshToken);

        public async Task<List<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) {
            return await context.Set<RefreshToken>()
                .Where(rt => rt.UserId == userId & rt.IsActive)
                .ToListAsync(cancellationToken);
        }
        
    }
}