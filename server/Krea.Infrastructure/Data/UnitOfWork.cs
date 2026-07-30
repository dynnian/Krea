using Krea.Domain.Abstractions;

namespace Krea.Infrastructure.Data {
    public sealed class UnitOfWork : IUnitOfWork {
        private readonly AppDbContext _context;

        public UnitOfWork(AppDbContext context) => _context = context;

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            => _context.SaveChangesAsync(cancellationToken);
    }
}