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

        public Task DeleteAsync(Post post, CancellationToken cancellationToken = default) {
            _context.Posts.Remove(post);
            return Task.CompletedTask;
        }
    }
}