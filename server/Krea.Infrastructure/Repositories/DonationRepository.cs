using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class DonationRepository
        : IDonationRepository {
        private readonly AppDbContext _context;

        public DonationRepository(AppDbContext context) => _context = context;

        public async Task<Donation?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
            await _context.Donations
                          .Include(d => d.Donor)
                          .Include(d => d.Recipient)
                          .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        public async Task<Donation?> GetByIdWithPaymentsAsync(Guid id, CancellationToken cancellationToken) =>
            await _context.Donations
                          .Include(d => d.Donor)
                          .Include(d => d.Recipient)
                          .Include(d => d.Payments)
                          .ThenInclude(p => p.Payer)
                          .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        public async Task<IReadOnlyList<Donation>> GetByDonorAsync(Guid donorId,
            CancellationToken cancellationToken) =>
            await _context.Donations
                          .Where(d => EF.Property<Guid>(d, "DonorId") == donorId)
                          .ToListAsync(cancellationToken);

        public async Task<IReadOnlyList<Donation>> GetByRecipientAsync(Guid recipientId,
            CancellationToken cancellationToken) =>
            await _context.Donations
                          .Where(d => EF.Property<Guid>(d, "RecipientId") == recipientId)
                          .ToListAsync(cancellationToken);

        public async Task Add(Donation donation) => await _context.Donations.AddAsync(donation);
    }
}