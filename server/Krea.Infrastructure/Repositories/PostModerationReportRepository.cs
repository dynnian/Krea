using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Domain.ValueObjects;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class PostModerationReportRepository : IPostModerationReportRepository {
        private readonly AppDbContext _context;

        public PostModerationReportRepository(AppDbContext context) {
            _context = context;
        }

        public async Task<PostModerationReport?> GetByIdAsync(Guid reportId, CancellationToken cancellationToken = default) =>
            await _context.Set<PostModerationReport>()
                .Include(r => r.Post)
                .Include(r => r.ReporterUser)
                .FirstOrDefaultAsync(r => r.Id == reportId, cancellationToken);

        public async Task<IReadOnlyList<PostModerationReport>> GetPagedAsync(
            PostModerationReportStatus? status,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default) {
            IQueryable<PostModerationReport> query = _context.Set<PostModerationReport>()
                .AsNoTracking()
                .Include(r => r.Post)
                .Include(r => r.ReporterUser);

            if (status.HasValue) {
                query = query.Where(r => r.Status == status.Value);
            }

            return await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public Task<int> CountAsync(PostModerationReportStatus? status, CancellationToken cancellationToken = default) {
            IQueryable<PostModerationReport> query = _context.Set<PostModerationReport>();
            if (status.HasValue) {
                query = query.Where(r => r.Status == status.Value);
            }

            return query.CountAsync(cancellationToken);
        }

        public async Task AddAsync(PostModerationReport report, CancellationToken cancellationToken = default) =>
            await _context.Set<PostModerationReport>().AddAsync(report, cancellationToken);

        public Task UpdateAsync(PostModerationReport report, CancellationToken cancellationToken = default) {
            _context.Set<PostModerationReport>().Update(report);
            return Task.CompletedTask;
        }
    }
}
