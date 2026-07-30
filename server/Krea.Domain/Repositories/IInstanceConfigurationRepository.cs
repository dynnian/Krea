using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IInstanceConfigurationRepository {
        Task<InstanceConfiguration?> GetAsync(CancellationToken cancellationToken = default);
        Task AddAsync(InstanceConfiguration configuration, CancellationToken cancellationToken = default);
        Task UpdateAsync(InstanceConfiguration configuration, CancellationToken cancellationToken = default);
    }
}