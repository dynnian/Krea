using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    using Abstractions;

    public interface IPostRepository {
        Task<Post?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<Post?> GetFullPostAsync(Guid id, CancellationToken cancellationToken = default);

        Task AddAsync(Post post, CancellationToken cancellationToken = default);

        Task UpdateAsync(Post post, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Post>> GetAllAsync(
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Post>> GetByUserAsync(
            Guid authorPostId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<int> CountAsync(CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Post>> GetRecentAsync(int take, CancellationToken cancellationToken = default);

        Task<(IReadOnlyList<Post> Posts, int TotalCount)> GetRepliesAsync(
            Guid postId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<List<Post>> GetRepliesTreeAsync(
            Guid postId,
            CancellationToken cancellationToken = default);

        Task<bool> ExistsRepostAsync(
            Guid originalPostId,
            Guid userId,
            CancellationToken cancellationToken = default);

        Task<Post?> GetRepostByUserAndTargetAsync(
            Guid originalPostId,
            Guid userId,
            CancellationToken cancellationToken = default);

        Task<HashSet<Guid>> GetRepostedTargetIdsAsync(
            Guid userId,
            IReadOnlyCollection<Guid> targetIds,
            CancellationToken ct);

        Task<PaginatedList<Post>> SearchAsync(
            string query,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);
    }
}