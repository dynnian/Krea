using Krea.Domain.Entities;

namespace Krea.Domain.Repositories;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<Subscription>> GetBySubscriberAsync(Guid subscriberId);
    Task<IReadOnlyList<Subscription>> GetByPlanAsync(Guid planId);
    Task AddAsync(Subscription subscription);
    Task UpdateAsync(Subscription subscription);
}