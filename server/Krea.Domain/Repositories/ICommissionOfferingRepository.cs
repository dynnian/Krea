using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface ICommissionOfferingRepository {
        Task<CommissionOffering?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<CommissionOffering>> GetByArtistAsync(Guid artistId,
                                                                 CancellationToken cancellationToken = default);

        Task<IReadOnlyList<CommissionOffering>> GetActiveAsync(CancellationToken cancellationToken = default);
        Task<int> GetActiveRequestCountAsync(Guid offeringId, CancellationToken cancellationToken = default);
        Task AddAsync(CommissionOffering offering, CancellationToken cancellationToken = default);
        Task UpdateAsync(CommissionOffering offering, CancellationToken cancellationToken = default);
        Task<CommissionOffering?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
        Task DeleteAsync(CommissionOffering offering, CancellationToken cancellationToken = default);
    }
}