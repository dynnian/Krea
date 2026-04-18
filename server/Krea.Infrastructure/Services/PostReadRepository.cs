namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Filter;
    using Application.Features.Posts.Dto;
    using Application.Features.Posts.Explore;
    using Data;
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;

    public sealed class PostReadRepository : IPostReadRepository {
        private readonly AppDbContext _context;

        public PostReadRepository(AppDbContext context) => _context = context;

        public async Task<PagedResult<ExplorePostDto>> ExploreAsync(
            ExploreQuery request,
            CancellationToken cancellationToken) {
            IQueryable<Post> query = _context.Posts
                                             .AsNoTracking()
                                             .Where(p => !p.IsDeleted);

            // Category (usando PostType)
            if (!string.IsNullOrWhiteSpace(request.Category)) {
                query = query.Where(p => p.Type.ToString() == request.Category);
            }

            // Genres
            if (request.Genres != null && request.Genres.Any()) {
                query = query.Where(p =>
                    p.Uploads.Any(u =>
                        u.Metadata != null &&
                        u.Metadata.Genres.Any(g =>
                            request.Genres.Select(x => x.ToLower()).Contains(g.Name.ToLower()))
                    )
                );
            }

            //  Hashtags en Post
            if (request.Tags != null && request.Tags.Any()) {
                query = query.Where(p =>
                    p.Hashtags.Any(h =>
                        request.Tags.Contains(h.Name)
                    )
                );
            }

            // Ordenar
            query = request.SortBy switch {
                "popular" => query.OrderByDescending(p => p.Likes.Count),
                _ => query.OrderByDescending(p => p.UploadedAt)
            };

            int total = await query.CountAsync(cancellationToken);

            List<ExplorePostDto> items = await query
                                               .Skip((request.Page - 1) * request.PageSize)
                                               .Take(request.PageSize)
                                               .Select(p => new ExplorePostDto {
                                                   Id = p.Id,
                                                   Title = p.Title,
                                                   UploadedAt = p.UploadedAt,
                                                   UserId = p.AuthorPostId,
                                                   AuthorUsername = p.AuthorPost.DisplayName,

                                                   // Genres
                                                   Genres = p.Uploads
                                                             .Where(u => u.Metadata != null)
                                                             .SelectMany(u => u.Metadata!.Genres)
                                                             .Select(g => g.Name)
                                                             .Distinct()
                                                             .ToList(),

                                                   // hashtags del post
                                                   Tags = p.Hashtags
                                                           .Select(h => h.Name)
                                                           .ToList(),

                                                   // Thumbnail media
                                                   PreviewUrl = p.Uploads
                                                                 .Select(u => u.Media.Path)
                                                                 .FirstOrDefault()
                                               })
                                               .ToListAsync(cancellationToken);

            return new PagedResult<ExplorePostDto>(
                items,
                total,
                request.Page,
                request.PageSize
            );
        }
    }
}