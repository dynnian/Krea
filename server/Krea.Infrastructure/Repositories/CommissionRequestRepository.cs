using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories;

public sealed class CommissionRequestRepository(AppDbContext context) 
    : ICommissionRequestRepository {
    
    public async Task<CommissionRequest?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.CommissionRequests
            .AsNoTracking()
            .Include(cr => cr.Bidder)
            .Include(cr => cr.Offering)
            .FirstOrDefaultAsync(cr => cr.Id == id, cancellationToken);
    }

    public async Task<CommissionRequest?> GetByIdWithPaymentsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.CommissionRequests
            .AsNoTracking()
            .Include(cr => cr.Bidder)
            .Include(cr => cr.Offering)
            .Include(cr => cr.Payments)
                .ThenInclude(p => p.Payer)
            .FirstOrDefaultAsync(cr => cr.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<CommissionRequest>> GetByBidderAsync(
        Guid bidderId,
        CancellationToken cancellationToken = default)
    {
        return await context.CommissionRequests
            .AsNoTracking()
            .Include(cr => cr.Offering)
            .Where(cr => cr.Bidder.Id == bidderId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommissionRequest>> GetByOfferingAsync(
        Guid offeringId,
        CancellationToken cancellationToken = default)
    {
        return await context.CommissionRequests
            .AsNoTracking()
            .Include(cr => cr.Bidder)
            .Where(cr => cr.Offering.Id == offeringId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
        CommissionRequest request,
        CancellationToken cancellationToken = default)
    {
        await context.CommissionRequests.AddAsync(request, cancellationToken);
    }

    public Task UpdateAsync(
        CommissionRequest request,
        CancellationToken cancellationToken = default)
    {
        context.CommissionRequests.Update(request);
        return Task.CompletedTask;
    }
}