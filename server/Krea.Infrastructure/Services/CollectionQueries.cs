namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Collection;
    using Application.Features.Collections.Dto;
    using Data;
    using Microsoft.EntityFrameworkCore;

    public class CollectionQueries : ICollectionQueries {
        private readonly AppDbContext _context;

        public CollectionQueries(AppDbContext context) => _context = context;

        public async Task<CollectionDetailDto?> GetByIdAsync(
            Guid collectionId,
            int page,
            int pageSize,
            CancellationToken cancellationToken) =>
            await _context.Collections
                          .AsNoTracking()
                          .Where(c => c.Id == collectionId)
                          .Select(c => new CollectionDetailDto {
                              Id = c.Id,
                              Title = c.Title,
                              Description = c.Description,
                              OwnerId = c.OwnerId,
                              ItemCount = c.ItemCount,
                              Type = c.Type,
                              CreatedAt = c.CreatedAt,
                              CoverMediaId = c.MediaId,
                              CoverUrl = c.MediaId != null
                                  ? _context.Media
                                            .Where(m => m.Id == c.MediaId)
                                            .Select(m => m.Path)
                                            .FirstOrDefault()
                                  : null,
                              Posts = c.Posts
                                       .OrderByDescending(p => p.UploadedAt)
                                       .Skip((page - 1) * pageSize)
                                       .Take(pageSize)
                                       .Select(p => new CollectionPostDto {
                                           Id = p.Id,
                                           Title = p.Title,
                                           AuthorId = p.AuthorPostId,
                                           UploadedAt = p.UploadedAt
                                       })
                                       .ToList()
                          })
                          .FirstOrDefaultAsync(cancellationToken);

        public async Task<IReadOnlyList<UserCollectionDto>> GetUserCollectionsAsync(
            Guid userId,
            CancellationToken cancellationToken) =>
            await _context.Collections
                          .AsNoTracking()
                          .Where(c => c.OwnerId == userId)
                          .OrderByDescending(c => c.UpdatedAt)
                          .Select(c => new UserCollectionDto {
                              Id = c.Id,
                              Title = c.Title,
                              ItemCount = c.ItemCount,
                              Type = c.Type,
                              UpdatedAt = c.UpdatedAt,
                              CoverMediaId = c.MediaId,
                              CoverUrl = c.MediaId != null
                                  ? _context.Media
                                            .Where(m => m.Id == c.MediaId)
                                            .Select(m => m.Path)
                                            .FirstOrDefault()
                                  : null
                          })
                          .ToListAsync(cancellationToken);
    }
}