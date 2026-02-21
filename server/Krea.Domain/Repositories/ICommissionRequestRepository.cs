using Krea.Domain.Entities;

namespace Krea.Domain.Repositories;

public interface ICommissionRequestRepository
{
    Task<CommissionRequest?> GetByIdAsync(Guid id);
    
    Task<IReadOnlyList<CommissionRequest>> GetByBidderAsync(Guid bidderId);
    
    Task<IReadOnlyList<CommissionRequest>> GetByOfferingAsync(Guid offeringId);

    Task AddAsync(CommissionRequest request);

    Task UpdateAsync(CommissionRequest request);
}