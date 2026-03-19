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
                          .Include(p => p.Uploads)
                          .ThenInclude(u => u.Metadata)
                          .ThenInclude(m => m.Genres)
                          .Include(p => p.Hashtags)
                          .Include(p => p.Likes)
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
            CancellationToken cancellationToken = default) {
            return await _context.Posts
                .AsNoTracking()
                .Where(p => p.AuthorPostId == authorPostId && !p.IsDeleted)
                .OrderByDescending(p => p.UploadedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(p => p.AuthorPost)
                .Include(p => p.Uploads)
                .ThenInclude(u => u.Media)
                .Include(p => p.Hashtags)
                .ToListAsync(cancellationToken);
        }

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
    }
}