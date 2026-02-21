using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories;

public sealed class DonationRepository 
    : IDonationRepository
{
    private readonly AppDbContext _context;

    public DonationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Donation?> GetByIdAsync(Guid id)
    {
        return await _context.Donations
            .Include(d => d.Donor)
            .Include(d => d.Recipient)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<IReadOnlyList<Donation>> GetByDonorAsync(Guid donorId)
    {
        return await _context.Donations
            .Where(d => EF.Property<Guid>(d, "DonorId") == donorId)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Donation>> GetByRecipientAsync(Guid recipientId)
    {
        return await _context.Donations
            .Where(d => EF.Property<Guid>(d, "RecipientId") == recipientId)
            .ToListAsync();
    }

    public async Task AddAsync(Donation donation)
    {
        await _context.Donations.AddAsync(donation);
    }
}