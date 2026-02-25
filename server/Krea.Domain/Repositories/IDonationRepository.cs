using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IDonationRepository {
        Task<Donation?> GetByIdAsync(Guid id);

        Task<Donation?> GetByIdWithPaymentsAsync(Guid id);

        Task<IReadOnlyList<Donation>> GetByDonorAsync(Guid donorId);

        Task<IReadOnlyList<Donation>> GetByRecipientAsync(Guid recipientId);

        Task AddAsync(Donation donation);
    }
}