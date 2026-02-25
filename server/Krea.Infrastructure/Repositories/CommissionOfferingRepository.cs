using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class CommissionOfferingRepository
        : ICommissionOfferingRepository {
        private readonly AppDbContext _context;

        public CommissionOfferingRepository(AppDbContext context) => _context = context;

        public async Task<CommissionOffering?> GetByIdAsync(Guid id) =>
            await _context.CommissionOfferings
                          .Include(o => o.Artist)
                          .FirstOrDefaultAsync(o => o.Id == id);

        public async Task<IReadOnlyList<CommissionOffering>> GetByArtistAsync(Guid artistId) =>
            await _context.CommissionOfferings
                          .Where(o => EF.Property<Guid>(o, "ArtistId") == artistId)
                          .ToListAsync();

        public async Task<IReadOnlyList<CommissionOffering>> GetActiveAsync() =>
            await _context.CommissionOfferings
                          .Where(o => o.IsActive)
                          .ToListAsync();

        public async Task AddAsync(CommissionOffering offering) =>
            await _context.CommissionOfferings.AddAsync(offering);

        public Task UpdateAsync(CommissionOffering offering) {
            _context.CommissionOfferings.Update(offering);
            return Task.CompletedTask;
        }
    }
}