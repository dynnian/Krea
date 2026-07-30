using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class DonationRepository(AppDbContext context) : IDonationRepository {
        public async Task<Donation?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
            await context.Donations
                         .Include(d => d.Donor)
                         .Include(d => d.Recipient)
                         .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        public async Task<Donation?> GetByIdWithPaymentsAsync(Guid id, CancellationToken cancellationToken) =>
            await context.Donations
                         .Include(d => d.Donor)
                         .Include(d => d.Recipient)
                         .Include(d => d.Payments)
                         .ThenInclude(p => p.Payer)
                         .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        public async Task<IReadOnlyList<Donation>> GetByDonorAsync(Guid donorId,
                                                                   CancellationToken cancellationToken) =>
            await context.Donations
                         .Where(d => EF.Property<Guid>(d, "DonorId") == donorId)
                         .ToListAsync(cancellationToken);

        public async Task<IReadOnlyList<Donation>> GetByRecipientAsync(Guid recipientId,
                                                                       CancellationToken cancellationToken) =>
            await context.Donations
                         .Where(d => EF.Property<Guid>(d, "RecipientId") == recipientId)
                         .ToListAsync(cancellationToken);

        public async Task Add(Donation donation) => await context.Donations.AddAsync(donation);
    }
}