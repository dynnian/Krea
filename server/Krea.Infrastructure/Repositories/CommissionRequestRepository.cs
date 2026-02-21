using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories;

public sealed class CommissionRequestRepository 
    : ICommissionRequestRepository
{
    private readonly AppDbContext _context;

    public CommissionRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CommissionRequest?> GetByIdAsync(Guid id)
    {
        return await _context.CommissionRequests
            .Include(cr => cr.Bidder)
            .Include(cr => cr.Offering)
            .FirstOrDefaultAsync(cr => cr.Id == id);
    }
    
    public async Task<CommissionRequest?> GetByIdWithPaymentsAsync(Guid id)
    {
        return await _context.CommissionRequests
            .Include(cr => cr.Bidder)
            .Include(cr => cr.Offering)
            .Include(cr => cr.Payments)
            .ThenInclude(p => p.Payer)
            .FirstOrDefaultAsync(cr => cr.Id == id);
    }

    public async Task<IReadOnlyList<CommissionRequest>> GetByBidderAsync(Guid bidderId)
    {
        return await _context.CommissionRequests
            .Include(cr => cr.Offering)
            .Where(cr => EF.Property<Guid>(cr, "BidderId") == bidderId)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<CommissionRequest>> GetByOfferingAsync(Guid offeringId)
    {
        return await _context.CommissionRequests
            .Include(cr => cr.Bidder)
            .Where(cr => EF.Property<Guid>(cr, "OfferingId") == offeringId)
            .ToListAsync();
    }

    public async Task AddAsync(CommissionRequest request)
    {
        await _context.CommissionRequests.AddAsync(request);
    }

    public Task UpdateAsync(CommissionRequest request)
    {
        _context.CommissionRequests.Update(request);
        return Task.CompletedTask;
    }
}