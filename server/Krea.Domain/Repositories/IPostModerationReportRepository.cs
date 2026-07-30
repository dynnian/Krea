using Krea.Domain.Entities;
using Krea.Domain.ValueObjects;

namespace Krea.Domain.Repositories {
    public interface IPostModerationReportRepository {
        Task<PostModerationReport?> GetByIdAsync(Guid reportId, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<PostModerationReport>> GetPagedAsync(
            PostModerationReportStatus? status,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<int> CountAsync(PostModerationReportStatus? status, CancellationToken cancellationToken = default);

        Task AddAsync(PostModerationReport report, CancellationToken cancellationToken = default);

        Task UpdateAsync(PostModerationReport report, CancellationToken cancellationToken = default);

        Task<bool> ExistsPendingByPostAndReporterAsync(
            Guid postId,
            Guid reporterUserId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<PostModerationReport>> GetByReporterPagedAsync(
            Guid reporterUserId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<int> CountByReporterAsync(
            Guid reporterUserId,
            CancellationToken cancellationToken = default);
    }
}