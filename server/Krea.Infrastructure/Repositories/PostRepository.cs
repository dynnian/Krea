using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public class PostRepository : IPostRepository {
        private readonly AppDbContext _context;

        public PostRepository(AppDbContext context) => _context = context;

        public async Task<Post?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            await _context.Posts
                          .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);

        public async Task<Post?> GetFullPostAsync(Guid id, CancellationToken cancellationToken = default) =>
            await _context.Posts
                          .Include(p => p.AuthorPost)
                          .ThenInclude(u => u.ProfilePicture)
                          .Include(p => p.Uploads)
                          .ThenInclude(u => u.Metadata)
                          .ThenInclude(m => m!.Genres)
                          .Include(p => p.Uploads)
                          .ThenInclude(u => u.Media)
                          .Include(p => p.Uploads)
                          .ThenInclude(u => u.CoverMedia)
                          .Include(p => p.Hashtags)
                          .Include(p => p.Likes)
                          .Include(p => p.RepostOf)
                          .ThenInclude(r => r!.AuthorPost)
                          .ThenInclude(u => u.ProfilePicture)
                          .Include(p => p.RepostOf)
                          .ThenInclude(r => r!.Uploads)
                          .ThenInclude(u => u.Metadata)
                          .ThenInclude(m => m!.Genres)
                          .Include(p => p.RepostOf)
                          .ThenInclude(r => r!.Uploads)
                          .ThenInclude(u => u.Media)
                          .Include(p => p.RepostOf)
                          .ThenInclude(r => r!.Uploads)
                          .ThenInclude(u => u.CoverMedia)
                          .Include(p => p.RepostOf)
                          .ThenInclude(r => r!.Hashtags)
                          .Include(p => p.RepostOf)
                          .ThenInclude(r => r!.Likes)
                          .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);

        public async Task AddAsync(Post post, CancellationToken cancellationToken = default) =>
            await _context.Posts.AddAsync(post, cancellationToken);

        public Task UpdateAsync(Post post, CancellationToken cancellationToken = default) {
            _context.Posts.Update(post);
            return Task.CompletedTask;
        }

        public async Task<IReadOnlyList<Post>> GetAllAsync(
            int page,
            int pageSize,
            CancellationToken cancellationToken = default) =>
            await _context.Posts
                          .AsNoTracking()
                          .AsSplitQuery()
                          .Where(p => !p.IsDeleted)
                          .OrderByDescending(p => p.UploadedAt)
                          .Skip((page - 1) * pageSize)
                          .Take(pageSize)
                          .Include(p => p.Uploads)
                          .ThenInclude(u => u.Media)
                          .Include(p => p.Hashtags)
                          .ToListAsync(cancellationToken);

        public async Task<IReadOnlyList<Post>> GetByUserAsync(
            Guid authorPostId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default) =>
            await _context.Posts
                        .AsNoTracking()
                        .Where(p => p.AuthorPostId == authorPostId && !p.IsDeleted)
                        .OrderByDescending(p => p.UploadedAt)
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize)
                        .Include(p => p.AuthorPost)
                            .ThenInclude(u => u.ProfilePicture)
                        .Include(p => p.Likes)
                        .Include(p => p.Uploads)
                        .ThenInclude(u => u.Media)
                        .Include(p => p.Uploads)
                        .ThenInclude(u => u.CoverMedia)
                        .Include(p => p.Uploads)
                        .ThenInclude(u => u.Metadata)
                        .ThenInclude(m => m!.Genres)
                        .Include(p => p.Hashtags)
                        .ToListAsync(cancellationToken);

        public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
            _context.Posts.CountAsync(p => !p.IsDeleted, cancellationToken);

        public async Task<IReadOnlyList<Post>> GetRecentAsync(int take, CancellationToken cancellationToken = default) {
            if (take <= 0)
                return Array.Empty<Post>();

            return await _context.Posts
                                 .AsNoTracking()
                                 .Where(p => !p.IsDeleted)
                                 .OrderByDescending(p => p.UploadedAt)
                                 .Take(take)
                                 .ToListAsync(cancellationToken);
        }

        public async Task<(IReadOnlyList<Post> Posts, int TotalCount)> GetRepliesAsync(
            Guid postId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default) {
            IOrderedQueryable<Post> query = _context.Posts
                                                    .Include(p => p.AuthorPost)
                                                        .ThenInclude(u => u.ProfilePicture)
                                                    .Where(p => p.RepliedToId == postId && !p.IsDeleted)
                                                    .OrderByDescending(p => p.UploadedAt);

            int totalCount = await query.CountAsync(cancellationToken);

            List<Post> posts = await query
                                     .Skip((page - 1) * pageSize)
                                     .Take(pageSize)
                                     .ToListAsync(cancellationToken);

            return (posts, totalCount);
        }

        public async Task<List<Post>> GetRepliesTreeAsync(
            Guid postId,
            CancellationToken cancellationToken = default) =>
            // Se traen los replies y se arma el "arbol" en memoria
            await _context.Posts
                          .AsNoTracking()
                          .Where(p => !p.IsDeleted && p.RepliedToId != null)
                          .Include(p => p.AuthorPost)
                              .ThenInclude(u => u.ProfilePicture)
                          .OrderBy(p => p.UploadedAt)
                          .ToListAsync(cancellationToken);

        public async Task<bool> ExistsRepostAsync(
            Guid originalPostId,
            Guid userId,
            CancellationToken cancellationToken = default) =>
            await _context.Posts
                          .AnyAsync(p => p.RepostOfId == originalPostId &&
                                         p.AuthorPostId == userId &&
                                         !p.IsDeleted, cancellationToken);
        
        public async Task<HashSet<Guid>> GetRepostedTargetIdsAsync(
            Guid authorId,
            IReadOnlyCollection<Guid> repostTargetIds,
            CancellationToken ct)
        {
            if (repostTargetIds.Count == 0)
                return [];

            return await _context.Posts
                .AsNoTracking()
                .Where(p =>
                    !p.IsDeleted &&
                    p.AuthorPostId == authorId &&
                    p.RepostOfId.HasValue &&
                    repostTargetIds.Contains(p.RepostOfId.Value))
                .Select(p => p.RepostOfId!.Value)
                .ToHashSetAsync(ct);
        }
    }
}