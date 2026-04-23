using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Domain.ValueObjects;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class PostModerationReportRepository : IPostModerationReportRepository {
        private readonly AppDbContext _context;

        public PostModerationReportRepository(AppDbContext context) => _context = context;

        public async Task<PostModerationReport?> GetByIdAsync(Guid reportId,
                                                              CancellationToken cancellationToken = default) =>
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
            await _context.PostModerationReports.AddAsync(report, cancellationToken);

        public Task UpdateAsync(PostModerationReport report, CancellationToken cancellationToken = default) {
            _context.Set<PostModerationReport>().Update(report);
            return Task.CompletedTask;
        }

        public async Task<bool> ExistsPendingByPostAndReporterAsync(
            Guid postId,
            Guid reporterUserId,
            CancellationToken cancellationToken = default) =>
            await _context.PostModerationReports
                          .AsNoTracking()
                          .AnyAsync(r =>
                                  r.PostId == postId &&
                                  r.ReporterUserId == reporterUserId &&
                                  r.Status == PostModerationReportStatus.Pending,
                              cancellationToken);

        public async Task<IReadOnlyList<PostModerationReport>> GetByReporterPagedAsync(
            Guid reporterUserId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default) =>
            await _context.PostModerationReports
                          .AsNoTracking()
                          .Where(r => r.ReporterUserId == reporterUserId)
                          .OrderByDescending(r => r.CreatedAt)
                          .Skip((page - 1) * pageSize)
                          .Take(pageSize)
                          .ToListAsync(cancellationToken);

        public async Task<int> CountByReporterAsync(
            Guid reporterUserId,
            CancellationToken cancellationToken = default) =>
            await _context.PostModerationReports
                          .AsNoTracking()
                          .CountAsync(r => r.ReporterUserId == reporterUserId, cancellationToken);
    }
}