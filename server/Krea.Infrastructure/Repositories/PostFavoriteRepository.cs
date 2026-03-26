namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public sealed class PostFavoriteRepository : IPostFavoriteRepository
    {
        private readonly AppDbContext _context;

        public PostFavoriteRepository(AppDbContext context) => _context = context;

        public async Task<bool> ExistsAsync(Guid userId, Guid postId)
        {
            return await _context.PostFavorites
                .AnyAsync(x => x.UserId == userId && x.PostId == postId);
        }

        public async Task AddAsync(PostFavorite favorite, CancellationToken ct)
        {
            await _context.PostFavorites.AddAsync(favorite, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<PostFavorite?> GetByUserAndPostAsync(Guid userId, Guid postId)
        {
            return await _context.PostFavorites
                .FirstOrDefaultAsync(x => x.UserId == userId && x.PostId == postId);
        }

        public void Delete(PostFavorite favorite)
        {
            _context.PostFavorites.Remove(favorite);
            _context.SaveChanges();
        }
        
        public async Task<PaginatedList<Post>> GetUserFavoritesAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken ct)
        {
            var query = _context.PostFavorites
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => x.Post)
                .Where(p => !p.IsDeleted);
            
            // metadata
            query = query
                .Include(p => p.AuthorPost)
                .Include(p => p.Uploads)
                .ThenInclude(u => u.Media)
                .Include(p => p.Uploads)
                .ThenInclude(u => u.Metadata)
                .ThenInclude(m => m.Genres);

            return await PaginatedList<Post>.CreateAsync(
                query,
                page,
                pageSize,
                ct);
        }
    }
}