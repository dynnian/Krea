using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class InstanceConfigurationRepository : IInstanceConfigurationRepository {
        private readonly AppDbContext _context;

        public InstanceConfigurationRepository(AppDbContext context) => _context = context;

        public Task<InstanceConfiguration?> GetAsync(CancellationToken cancellationToken = default) =>
            _context.Set<InstanceConfiguration>()
                    .OrderByDescending(x => x.UpdatedAt)
                    .FirstOrDefaultAsync(cancellationToken);

        public async Task
            AddAsync(InstanceConfiguration configuration, CancellationToken cancellationToken = default) =>
            await _context.Set<InstanceConfiguration>().AddAsync(configuration, cancellationToken);

        public Task UpdateAsync(InstanceConfiguration configuration, CancellationToken cancellationToken = default) {
            _context.Set<InstanceConfiguration>().Update(configuration);
            return Task.CompletedTask;
        }
    }
}