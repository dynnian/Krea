using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface ISubscriptionRepository {
        Task<Subscription?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<Subscription?> GetByIdWithPaymentsAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Subscription>> GetBySubscriberAsync(
            Guid subscriberId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Subscription>> GetByPlanAsync(
            Guid planId,
            CancellationToken cancellationToken = default);

        Task Add(Subscription subscription);
        Task Update(Subscription subscription);
    }
}