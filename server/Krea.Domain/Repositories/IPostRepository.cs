using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
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
    }
}