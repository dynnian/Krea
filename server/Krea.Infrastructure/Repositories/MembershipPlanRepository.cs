using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class MembershipPlanRepository
        : IMembershipPlanRepository {
        private readonly AppDbContext _context;

        public MembershipPlanRepository(AppDbContext context) => _context = context;

        public async Task<MembershipPlan?> GetByIdAsync(Guid id) =>
            await _context.MembershipPlans
                          .Include(p => p.Artist)
                          .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<IReadOnlyList<MembershipPlan>> GetByArtistAsync(Guid artistId) =>
            await _context.MembershipPlans
                          .Where(p => EF.Property<Guid>(p, "ArtistId") == artistId)
                          .ToListAsync();

        public async Task AddAsync(MembershipPlan plan) => await _context.MembershipPlans.AddAsync(plan);

        public Task UpdateAsync(MembershipPlan plan) {
            _context.MembershipPlans.Update(plan);
            return Task.CompletedTask;
        }
    }
}