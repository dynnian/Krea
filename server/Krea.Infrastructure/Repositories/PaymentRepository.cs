using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories;

public sealed class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Payment?> GetByIdAsync(Guid id)
    {
        return await _context.Payments
            .Include(p => p.Payer)
            .Include(p => p.Subscription)
            .Include(p => p.Donation)
            .Include(p => p.CommissionRequest)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IReadOnlyList<Payment>> GetBySubscriptionAsync(Guid subscriptionId)
    {
        return await _context.Payments
            .Where(p => EF.Property<Guid?>(p, "SubscriptionId") == subscriptionId)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Payment>> GetByDonationAsync(Guid donationId)
    {
        return await _context.Payments
            .Where(p => EF.Property<Guid?>(p, "DonationId") == donationId)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Payment>> GetByCommissionAsync(Guid commissionId)
    {
        return await _context.Payments
            .Where(p => EF.Property<Guid?>(p, "CommissionRequestId") == commissionId)
            .ToListAsync();
    }

    public async Task AddAsync(Payment payment)
    {
        await _context.Payments.AddAsync(payment);
    }

    public Task UpdateAsync(Payment payment)
    {
        _context.Payments.Update(payment);
        return Task.CompletedTask;
    }
}