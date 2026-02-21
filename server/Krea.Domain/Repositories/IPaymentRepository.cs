using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IPaymentRepository {
        Task<Payment?> GetByIdAsync(Guid id);
        
        Task<IReadOnlyList<Payment>> GetBySubscriptionAsync(Guid subscriptionId);
        Task<IReadOnlyList<Payment>> GetByDonationAsync(Guid donationId);
        Task<IReadOnlyList<Payment>> GetByCommissionAsync(Guid commissionId);
        
        Task AddAsync(Payment payment);
        Task UpdateAsync(Payment payment);
    }
}