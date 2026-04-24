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
            DateTime now = DateTime.UtcNow;
            int diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
            DateTime startOfWeek = now.Date.AddDays(-diff);

            IQueryable<Post> baseQuery = _context.Posts
                .AsNoTracking()
                .Where(p => !p.IsDeleted
                            && p.RepliedToId == null
                            && p.RepostOfId == null);

            // Category
            if (!string.IsNullOrWhiteSpace(request.Category) &&
                Enum.TryParse<PostType>(request.Category, true, out var category)) {
                baseQuery = baseQuery.Where(p => p.Type == category);
            }

            // Genres
            if (request.Genres is { Count: > 0 }) {
                var normalizedGenres = request.Genres
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Select(x => x.Trim().ToLower())
                    .Distinct()
                    .ToList();

                if (normalizedGenres.Count > 0) {
                    baseQuery = baseQuery.Where(p =>
                        p.Uploads.Any(u =>
                            u.Metadata != null &&
                            u.Metadata.Genres.Any(g =>
                                normalizedGenres.Contains(g.Name.ToLower()))));
                }
            }

            // Tags
            if (request.Tags is { Count: > 0 }) {
                var normalizedTags = request.Tags
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Select(x => x.Trim().ToLower())
                    .Distinct()
                    .ToList();

                if (normalizedTags.Count > 0) {
                    baseQuery = baseQuery.Where(p =>
                        p.Hashtags.Any(h => normalizedTags.Contains(h.Name.ToLower())));
                }
            }

            int total = await baseQuery.CountAsync(cancellationToken);

            IQueryable<Post> orderedQuery = (request.SortBy?.Trim().ToLower()) switch {
                "popular" or "trending" => baseQuery
                    .Select(p => new { Post = p, WeeklyLikes = p.Likes.Count(l => l.CreatedAt >= startOfWeek) })
                    .OrderByDescending(x => x.WeeklyLikes)
                    .ThenByDescending(x => x.Post.UploadedAt)
                    .Select(x => x.Post),

                _ => baseQuery
                    .OrderByDescending(p => p.UploadedAt)
            };

            List<ExplorePostDto> items = await orderedQuery
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
                        .FirstOrDefault(),

                    CoverUrl = p.Uploads
                        .Where(u => u.CoverMedia != null)
                        .Select(u => u.CoverMedia!.Path)
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