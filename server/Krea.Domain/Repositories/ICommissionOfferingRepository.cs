using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface ICommissionOfferingRepository {
        Task<CommissionOffering?> GetByIdAsync(Guid id);

        Task<IReadOnlyList<CommissionOffering>> GetByArtistAsync(Guid artistId);

        Task<IReadOnlyList<CommissionOffering>> GetActiveAsync();

        Task AddAsync(CommissionOffering offering);

        Task UpdateAsync(CommissionOffering offering);
    }
}