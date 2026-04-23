namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Filter;
    using Application.Features.Posts.Dto;
    using Application.Features.Posts.Explore;
    using Data;
    using Domain.Entities;
    using Domain.ValueObjects;
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
            if (!string.IsNullOrWhiteSpace(request.Category) &&
                Enum.TryParse<PostType>(request.Category, true, out var category)) {
                query = query.Where(p => p.Type == category);
            }

            // Genres
            if (request.Genres != null && request.Genres.Any()) {
                var normalizedGenres = request.Genres
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Select(x => x.Trim().ToLower())
                    .ToList();

                query = query.Where(p =>
                    p.Uploads.Any(u =>
                        u.Metadata != null &&
                        u.Metadata.Genres.Any(g =>
                            normalizedGenres.Contains(g.Name.ToLower()))
                    )
                );
            }

            // Hashtags en Post
            if (request.Tags != null && request.Tags.Any()) {
                var normalizedTags = request.Tags
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Select(x => x.Trim().ToLower())
                    .ToList();

                query = query.Where(p =>
                    p.Hashtags.Any(h => normalizedTags.Contains(h.Name.ToLower()))
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
                    Category = p.Type.ToString(),
                    Genres = p.Uploads
                        .Where(u => u.Metadata != null)
                        .SelectMany(u => u.Metadata!.Genres)
                        .Select(g => g.Name)
                        .Distinct()
                        .ToList(),
                    Tags = p.Hashtags
                        .Select(h => h.Name)
                        .ToList(),
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