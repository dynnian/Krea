namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Feed;
    using Application.Features.Posts.Dto;
    using Data;
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;

    public sealed class FeedQueryService : IFeedQueryService {
        private readonly AppDbContext _context;

        public FeedQueryService(AppDbContext context) => _context = context;

        public async Task<IReadOnlyList<PostFeedResponse>> GetRecentAsync(
            Guid? currentUserId,
            int page,
            int pageSize,
            CancellationToken ct) =>
            await _context.Posts
                          .AsNoTracking()
                          .Where(p => !p.IsDeleted)
                          .OrderByDescending(p => p.UploadedAt)
                          .Skip((page - 1) * pageSize)
                          .Take(pageSize)
                          .Select(p => new PostFeedResponse {
                              Id = p.Id,
                              Title = p.Title,
                              Content = p.Content!,
                              AuthorId = p.AuthorPostId,
                              AuthorUsername = p.AuthorPost.DisplayName,
                              UploadedAt = p.UploadedAt,
                              MediaPreviewUrl = p.RepostOfId == null
                                  ? p.Uploads.Select(u => u.Media.Path).FirstOrDefault()
                                  : p.RepostOf!.Uploads.Select(u => u.Media.Path).FirstOrDefault(),
                              MediaMimeType = p.RepostOfId == null
                                  ? p.Uploads.Select(u => u.Media.MimeType).FirstOrDefault()
                                  : p.RepostOf!.Uploads.Select(u => u.Media.MimeType).FirstOrDefault(),
                              LikeCount = p.Likes.Count(),
                              IsLikedByCurrentUser = currentUserId != null &&
                                                     p.Likes.Any(l => l.UserId == currentUserId),
                              IsRetweetedByCurrentUser = currentUserId != null &&
                                                         _context.Posts.Any(r =>
                                                             !r.IsDeleted &&
                                                             r.AuthorPostId == currentUserId &&
                                                             r.RepostOfId == (p.RepostOfId ?? p.Id)),
                              IsFavorite = currentUserId != null &&
                                           p.Favorites.Any(f => f.UserId == currentUserId),
                              ReplyCount = _context.Posts.Count(r => r.RepliedToId == p.Id),
                              RepostCount = _context.Posts.Count(r => r.RepostOfId == (p.RepostOfId ?? p.Id)),
                              RepostOfId = p.RepostOfId,
                              RepostOf = p.RepostOf == null
                                  ? null
                                  : new RepostFeedReferenceDto {
                                      Id = p.RepostOf.Id,
                                      Title = p.RepostOf.Title,
                                      Content = p.RepostOf.Content!,
                                      AuthorId = p.RepostOf.AuthorPostId,
                                      AuthorUsername = p.RepostOf.AuthorPost.DisplayName,
                                      UploadedAt = p.RepostOf.UploadedAt,
                                      MediaPreviewUrl = p.RepostOf.Uploads
                                                         .Select(u => u.Media.Path)
                                                         .FirstOrDefault(),
                                      MediaMimeType = p.RepostOf.Uploads
                                                       .Select(u => u.Media.MimeType)
                                                       .FirstOrDefault(),
                                      LikeCount = p.RepostOf.Likes.Count(),
                                      ReplyCount = _context.Posts.Count(r => r.RepliedToId == p.RepostOf.Id),
                                      RepostCount = _context.Posts.Count(r => r.RepostOfId == p.RepostOf.Id)
                                  }
                          })
                          .ToListAsync(ct);

        public async Task<IReadOnlyList<PostFeedResponse>> GetFollowingFeedAsync(
            Guid currentUserId,
            int page,
            int pageSize,
            CancellationToken ct) {
            IQueryable<Guid> followingIds = _context.Set<Follow>()
                                                    .Where(f => f.SourceId == currentUserId)
                                                    .Select(f => f.TargetId);

            return await _context.Posts
                                 .AsNoTracking()
                                 .Where(p => !p.IsDeleted &&
                                             followingIds.Contains(p.AuthorPostId))
                                 .OrderByDescending(p => p.UploadedAt)
                                 .Skip((page - 1) * pageSize)
                                 .Take(pageSize)
                                 .Select(p => new PostFeedResponse {
                                     Id = p.Id,
                                     Title = p.Title,
                                     Content = p.Content!,
                                     AuthorId = p.AuthorPostId,
                                     AuthorUsername = p.AuthorPost.DisplayName,
                                     UploadedAt = p.UploadedAt,
                                     MediaPreviewUrl = p.RepostOfId == null
                                         ? p.Uploads.Select(u => u.Media.Path).FirstOrDefault()
                                         : p.RepostOf!.Uploads.Select(u => u.Media.Path).FirstOrDefault(),
                                     MediaMimeType = p.RepostOfId == null
                                         ? p.Uploads.Select(u => u.Media.MimeType).FirstOrDefault()
                                         : p.RepostOf!.Uploads.Select(u => u.Media.MimeType).FirstOrDefault(),
                                     LikeCount = p.Likes.Count(),
                                     IsLikedByCurrentUser = p.Likes.Any(l => l.UserId == currentUserId),
                                     IsRetweetedByCurrentUser = _context.Posts.Any(r => !r.IsDeleted &&
                                         r.AuthorPostId == currentUserId &&
                                         r.RepostOfId == (p.RepostOfId ?? p.Id)),
                                     IsFavorite = p.Favorites.Any(f => f.UserId == currentUserId),
                                     ReplyCount = _context.Posts.Count(r => r.RepliedToId == p.Id),
                                     RepostCount = _context.Posts.Count(r => r.RepostOfId == (p.RepostOfId ?? p.Id)),
                                     RepostOfId = p.RepostOfId,
                                     RepostOf = p.RepostOf == null
                                         ? null
                                         : new RepostFeedReferenceDto {
                                             Id = p.RepostOf.Id,
                                             AuthorId = p.RepostOf.AuthorPostId,
                                             AuthorUsername = p.RepostOf.AuthorPost.DisplayName,
                                             Title = p.RepostOf.Title,
                                             Content = p.RepostOf.Content!,
                                             UploadedAt = p.RepostOf.UploadedAt,
                                             MediaPreviewUrl = p.RepostOf.Uploads
                                                                .Select(u => u.Media.Path)
                                                                .FirstOrDefault(),
                                             MediaMimeType = p.RepostOf.Uploads
                                                              .Select(u => u.Media.MimeType)
                                                              .FirstOrDefault(),
                                             LikeCount = p.RepostOf.Likes.Count(),
                                             ReplyCount = _context.Posts.Count(r => r.RepliedToId == p.RepostOf.Id),
                                             RepostCount = _context.Posts.Count(r => r.RepostOfId == p.RepostOf.Id)
                                         }
                                 })
                                 .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<PostFeedResponse>> GetTrendingAsync(
            Guid currentUserId,
            int page,
            int pageSize,
            CancellationToken ct) {
            DateTime now = DateTime.UtcNow;

            int diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
            DateTime startOfWeek = now.Date.AddDays(-diff);

            return await _context.Posts
                                 .AsNoTracking()
                                 .Where(p => !p.IsDeleted)
                                 .Select(p => new {
                                     Post = p, WeeklyLikes = p.Likes.Count(l => l.CreatedAt >= startOfWeek)
                                 })
                                 .OrderByDescending(x => x.WeeklyLikes)
                                 .ThenByDescending(x => x.Post.UploadedAt)
                                 .Skip((page - 1) * pageSize)
                                 .Take(pageSize)
                                 .Select(x => new PostFeedResponse {
                                     Id = x.Post.Id,
                                     Title = x.Post.Title,
                                     Content = x.Post.Content!,
                                     AuthorId = x.Post.AuthorPostId,
                                     AuthorUsername = x.Post.AuthorPost.DisplayName,
                                     UploadedAt = x.Post.UploadedAt,
                                     MediaPreviewUrl = x.Post.RepostOfId == null
                                         ? x.Post.Uploads.Select(u => u.Media.Path).FirstOrDefault()
                                         : x.Post.RepostOf!.Uploads.Select(u => u.Media.Path).FirstOrDefault(),
                                     MediaMimeType = x.Post.RepostOfId == null
                                         ? x.Post.Uploads.Select(u => u.Media.MimeType).FirstOrDefault()
                                         : x.Post.RepostOf!.Uploads.Select(u => u.Media.MimeType).FirstOrDefault(),
                                     LikeCount = x.Post.Likes.Count(),
                                     IsLikedByCurrentUser =
                                         x.Post.Likes.Any(l => l.UserId == currentUserId),
                                     IsRetweetedByCurrentUser = _context.Posts.Any(r =>
                                         !r.IsDeleted &&
                                         r.AuthorPostId == currentUserId &&
                                         r.RepostOfId == (x.Post.RepostOfId ?? x.Post.Id)),
                                     IsFavorite = x.Post.Favorites.Any(f => f.UserId == currentUserId),
                                     ReplyCount = _context.Posts.Count(r => r.RepliedToId == x.Post.Id),
                                     RepostCount =
                                         _context.Posts.Count(r => r.RepostOfId == (x.Post.RepostOfId ?? x.Post.Id)),
                                     RepostOfId = x.Post.RepostOfId,
                                     RepostOf = x.Post.RepostOf == null
                                         ? null
                                         : new RepostFeedReferenceDto {
                                             Id = x.Post.RepostOf.Id,
                                             Title = x.Post.RepostOf.Title,
                                             Content = x.Post.RepostOf.Content!,
                                             AuthorId = x.Post.RepostOf.AuthorPostId,
                                             AuthorUsername = x.Post.RepostOf.AuthorPost.DisplayName,
                                             UploadedAt = x.Post.RepostOf.UploadedAt,
                                             MediaPreviewUrl = x.Post.RepostOf.Uploads
                                                                .Select(u => u.Media.Path)
                                                                .FirstOrDefault(),
                                             MediaMimeType = x.Post.RepostOf.Uploads
                                                              .Select(u => u.Media.MimeType)
                                                              .FirstOrDefault(),
                                             LikeCount = x.Post.RepostOf.Likes.Count(),
                                             ReplyCount =
                                                 _context.Posts.Count(r => r.RepliedToId == x.Post.RepostOf.Id),
                                             RepostCount = _context.Posts.Count(r => r.RepostOfId == x.Post.RepostOf.Id)
                                         }
                                 })
                                 .ToListAsync(ct);
        }
    }
}