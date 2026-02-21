using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IPaymentRepository {
        Task<Payment?> GetByIdAsync(Guid id);
        Task AddAsync(Payment payment);
        Task UpdateAsync(Payment payment);
    }
}