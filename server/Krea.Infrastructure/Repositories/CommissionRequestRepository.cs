using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class CommissionRequestRepository(AppDbContext context)
        : ICommissionRequestRepository {
        public async Task<CommissionRequest?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default) =>
            await context.CommissionRequests
                         .AsNoTracking()
                         .Include(cr => cr.Bidder)
                         .Include(cr => cr.Offering)
                         .FirstOrDefaultAsync(cr => cr.Id == id, cancellationToken);

        public async Task<IReadOnlyList<CommissionRequest>> GetByArtistAsync(
            Guid artistId, CancellationToken cancellationToken = default) =>
            await context.CommissionRequests
                         .AsNoTracking()
                         .Include(cr => cr.Bidder)
                         .Include(cr => cr.Offering)
                         .Where(cr => cr.Offering.Artist.Id == artistId)
                         .ToListAsync(cancellationToken);

        public async Task<CommissionRequest?> GetByIdWithAllAsync(
            Guid id,
            CancellationToken cancellationToken = default) =>
            await context.CommissionRequests
                         .Include(cr => cr.Bidder)
                         .Include(cr => cr.Offering)
                         .ThenInclude(o => o.Artist)
                         .Include(cr => cr.Payments)
                         .ThenInclude(p => p.Payer)
                         .Include(cr => cr.Submissions)
                         .ThenInclude(s => s.Media)
                         .Include(cr => cr.Submissions)
                         .ThenInclude(s => s.Feedback)
                         .ThenInclude(f => f.Author)
                         .FirstOrDefaultAsync(cr => cr.Id == id, cancellationToken);

        public async Task<CommissionRequest?> GetByIdWithPaymentsAsync(
            Guid id,
            CancellationToken cancellationToken = default) =>
            await context.CommissionRequests
                         .Include(cr => cr.Bidder)
                         .Include(cr => cr.Offering)
                         .Include(cr => cr.Payments)
                         .ThenInclude(p => p.Payer)
                         .FirstOrDefaultAsync(cr => cr.Id == id, cancellationToken);

        public async Task<CommissionRequest?> GetByIdWithSubmissionsAsync(
            Guid id,
            CancellationToken cancellationToken = default) =>
            await context.CommissionRequests
                         .Include(cr => cr.Bidder)
                         .Include(cr => cr.Offering)
                         .Include(cr => cr.Submissions)
                         .ThenInclude(s => s.Media)
                         .Include(cr => cr.Submissions)
                         .ThenInclude(s => s.Feedback)
                         .ThenInclude(f => f.Author)
                         .FirstOrDefaultAsync(cr => cr.Id == id, cancellationToken);

        public async Task<IReadOnlyList<CommissionRequest>> GetByBidderAsync(
            Guid bidderId,
            CancellationToken cancellationToken = default) =>
            await context.CommissionRequests
                         .AsNoTracking()
                         .Include(cr => cr.Offering)
                         .Where(cr => cr.Bidder.Id == bidderId)
                         .ToListAsync(cancellationToken);

        public async Task<IReadOnlyList<CommissionRequest>> GetByOfferingAsync(
            Guid offeringId,
            CancellationToken cancellationToken = default) =>
            await context.CommissionRequests
                         .AsNoTracking()
                         .Include(cr => cr.Bidder)
                         .Where(cr => cr.Offering.Id == offeringId)
                         .ToListAsync(cancellationToken);

        public async Task<CommissionRequest?> GetBySubmissionIdAsync(Guid submissionId,
                                                                     CancellationToken cancellationToken) =>
            await context.CommissionRequests
                         .Include(cr => cr.Bidder)
                         .Include(cr => cr.Offering)
                         .ThenInclude(o => o.Artist)
                         .Include(cr => cr.Submissions)
                         .ThenInclude(s => s.Feedback)
                         .ThenInclude(f => f.Author)
                         .Where(cr => cr.Submissions.Any(s => s.Id == submissionId))
                         .FirstOrDefaultAsync(cancellationToken);

        public async Task<CommissionRequest?>
            GetByFeedbackIdAsync(Guid feedbackId, CancellationToken cancellationToken) =>
            await context.CommissionRequests
                         .Include(cr => cr.Bidder)
                         .Include(cr => cr.Offering)
                         .ThenInclude(o => o.Artist)
                         .Include(cr => cr.Submissions)
                         .ThenInclude(s => s.Feedback)
                         .ThenInclude(f => f.Author)
                         .Where(cr => cr.Submissions.Any(s => s.Feedback.Any(f => f.Id == feedbackId)))
                         .FirstOrDefaultAsync(cancellationToken);

        public async Task<CommissionRequest?> GetByIdWithOfferingForUpdateAsync(
            Guid id, CancellationToken cancellationToken = default) =>
            await context.CommissionRequests
                         .Include(cr => cr.Bidder)
                         .Include(cr => cr.Offering)
                         .ThenInclude(o => o.Artist)
                         .FirstOrDefaultAsync(cr => cr.Id == id, cancellationToken);

        public async Task AddAsync(
            CommissionRequest request,
            CancellationToken cancellationToken = default) =>
            await context.CommissionRequests.AddAsync(request, cancellationToken);

        public Task UpdateAsync(
            CommissionRequest request,
            CancellationToken cancellationToken = default) {
            context.CommissionRequests.Update(request);
            return Task.CompletedTask;
        }
    }
}