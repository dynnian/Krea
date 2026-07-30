namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public sealed class PostFavoriteRepository : IPostFavoriteRepository {
        private readonly AppDbContext _context;

        public PostFavoriteRepository(AppDbContext context) => _context = context;

        public async Task<bool> ExistsAsync(Guid userId, Guid postId) =>
            await _context.PostFavorites
                          .AnyAsync(x => x.UserId == userId && x.PostId == postId);

        public async Task AddAsync(PostFavorite favorite, CancellationToken ct) {
            await _context.PostFavorites.AddAsync(favorite, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<PostFavorite?> GetByUserAndPostAsync(Guid userId, Guid postId) =>
            await _context.PostFavorites
                          .FirstOrDefaultAsync(x => x.UserId == userId && x.PostId == postId);

        public void Delete(PostFavorite favorite) {
            _context.PostFavorites.Remove(favorite);
            _context.SaveChanges();
        }

        public async Task<PaginatedList<Post>> GetUserFavoritesAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken ct) {
            IOrderedQueryable<Post> query = _context.Posts
                                                    .AsNoTracking()
                                                    .Where(p => p.Favorites.Any(f => f.UserId == userId) &&
                                                                !p.IsDeleted)
                                                    .Include(p => p.AuthorPost)
                                                    .ThenInclude(u => u.ProfilePicture)
                                                    .Include(p => p.Likes)
                                                    .Include(p => p.Uploads)
                                                    .ThenInclude(u => u.Media)
                                                    .Include(p => p.Uploads)
                                                    .ThenInclude(u => u.CoverMedia)
                                                    .OrderByDescending(p => p.UploadedAt);

            return await PaginatedList<Post>.CreateAsync(query, page, pageSize, ct);
        }

        public async Task<HashSet<Guid>> GetFavoritePostIdsAsync(
            Guid userId,
            IReadOnlyCollection<Guid> postIds,
            CancellationToken ct) {
            if (postIds.Count == 0)
                return [];

            return await _context.PostFavorites
                                 .AsNoTracking()
                                 .Where(x =>
                                     x.UserId == userId &&
                                     postIds.Contains(x.PostId))
                                 .Select(x => x.PostId)
                                 .ToHashSetAsync(ct);
        }
    }
}