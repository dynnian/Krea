using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IMembershipPlanRepository {
        Task<MembershipPlan?> GetByIdAsync(Guid id);
        Task<IReadOnlyList<MembershipPlan>> GetByArtistAsync(Guid artistId);
        Task AddAsync(MembershipPlan plan);
        Task UpdateAsync(MembershipPlan plan);
    }
}