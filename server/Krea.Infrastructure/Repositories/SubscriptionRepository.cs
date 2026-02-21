using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories;

public sealed class SubscriptionRepository 
    : ISubscriptionRepository
{
    private readonly AppDbContext _context;

    public SubscriptionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Subscription?> GetByIdAsync(Guid id)
    {
        return await _context.Subscriptions
            .Include(s => s.Subscriber)
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IReadOnlyList<Subscription>> GetBySubscriberAsync(Guid subscriberId)
    {
        return await _context.Subscriptions
            .Include(s => s.Plan)
            .Where(s => EF.Property<Guid>(s, "SubscriberId") == subscriberId)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Subscription>> GetByPlanAsync(Guid planId)
    {
        return await _context.Subscriptions
            .Include(s => s.Subscriber)
            .Where(s => EF.Property<Guid>(s, "PlanId") == planId)
            .ToListAsync();
    }

    public async Task AddAsync(Subscription subscription)
    {
        await _context.Subscriptions.AddAsync(subscription);
    }

    public Task UpdateAsync(Subscription subscription)
    {
        _context.Subscriptions.Update(subscription);
        return Task.CompletedTask;
    }
}