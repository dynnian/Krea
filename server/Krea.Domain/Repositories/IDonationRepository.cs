using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IDonationRepository {
        Task<Donation?> GetByIdAsync(
            Guid id, 
            CancellationToken cancellationToken = default);

        Task<Donation?> GetByIdWithPaymentsAsync(
            Guid id,  
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Donation>> GetByDonorAsync(
            Guid donorId,  
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Donation>> GetByRecipientAsync(
            Guid recipientId,  
            CancellationToken cancellationToken = default);

        Task Add(Donation donation);
    }
}