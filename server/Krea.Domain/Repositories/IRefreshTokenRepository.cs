namespace Krea.Domain.Repositories {
    using Entities;

    public interface IRefreshTokenRepository {
        Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
        void Add(RefreshToken refreshToken);
        void Update(RefreshToken refreshToken);
        Task<List<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}