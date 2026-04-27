using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories;

using Domain.ValueObjects;

public sealed class CommissionOfferingRepository(AppDbContext context) : ICommissionOfferingRepository
{
    public async Task<CommissionOffering?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.CommissionOfferings
            .AsNoTracking()
            .Include(o => o.Artist)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<CommissionOffering>> GetByArtistAsync(Guid artistId, CancellationToken cancellationToken = default)
    {
        return await context.CommissionOfferings
            .AsNoTracking()
            .Where(o => o.Artist.Id == artistId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommissionOffering>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await context.CommissionOfferings
            .AsNoTracking()
            .Include(o => o.Artist)
            .Where(o => o.IsActive)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetActiveRequestCountAsync(Guid offeringId, CancellationToken cancellationToken = default)
    {
        var statuses = new[] { CommissionRequestStatus.Accepted, CommissionRequestStatus.InProgress, CommissionRequestStatus.Delivered };
        return await context.CommissionRequests
            .CountAsync(cr => cr.Offering.Id == offeringId && statuses.Contains(cr.Status), cancellationToken);
    }

    public async Task AddAsync(CommissionOffering offering, CancellationToken cancellationToken = default)
    {
        await context.CommissionOfferings.AddAsync(offering, cancellationToken);
    }

    public Task UpdateAsync(CommissionOffering offering, CancellationToken cancellationToken = default)
    {
        context.CommissionOfferings.Update(offering);
        return Task.CompletedTask;
    }

    public async Task<CommissionOffering?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.CommissionOfferings
            .Include(o => o.Artist)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }
    
    public Task DeleteAsync(CommissionOffering offering, CancellationToken cancellationToken = default)
    {
        context.CommissionOfferings.Remove(offering);
        return Task.CompletedTask;
    }
}