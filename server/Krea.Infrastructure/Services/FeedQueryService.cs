namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Feed;
    using Application.Features.Posts.Dto;
    using Data;
    using Domain.Entities;
    using Microsoft.EntityFrameworkCore;

    public sealed class FeedQueryService : IFeedQueryService
    {
        private readonly AppDbContext _context;

        public FeedQueryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<PostFeedResponse>> GetRecentAsync(
            Guid? currentUserId,
            int page,
            int pageSize,
            CancellationToken ct)
        {
            return await _context.Posts
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .OrderByDescending(p => p.UploadedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostFeedResponse
                {
                    Id = p.Id,
                    Title = p.Title,
                    Content = p.Content!,
                    AuthorId = p.AuthorPostId,
                    AuthorUsername = p.AuthorPost.DisplayName,
                    UploadedAt = p.UploadedAt,
                    MediaPreviewUrl = p.Uploads
                        .Select(u => u.Media.Path)
                        .FirstOrDefault(),
                    MediaMimeType = p.Uploads
                        .Select(u => u.Media.MimeType)
                        .FirstOrDefault(),
                    LikeCount = p.Likes.Count(),
                    IsLikedByCurrentUser =
                        p.Likes.Any(l => l.UserId == currentUserId),
                    IsFavorite = currentUserId != null && p.Favorites.Any(f => f.UserId == currentUserId),
                    ReplyCount =
                        _context.Posts.Count(r => r.RepliedToId == p.Id),
                    RepostCount =
                        _context.Posts.Count(r => r.RepostOfId == p.Id)
                })
                .ToListAsync(ct);
        }
        
        public async Task<IReadOnlyList<PostFeedResponse>> GetFollowingFeedAsync(
            Guid currentUserId,
            int page,
            int pageSize,
            CancellationToken ct)
        {
            var followingIds = _context.Set<Follow>()
                .Where(f => f.SourceId == currentUserId)
                .Select(f => f.TargetId);

            return await _context.Posts
                .AsNoTracking()
                .Where(p =>
                    !p.IsDeleted &&
                    followingIds.Contains(p.AuthorPostId))
                .OrderByDescending(p => p.UploadedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostFeedResponse
                {
                    Id = p.Id,
                    Title = p.Title,
                    Content = p.Content!,
                    AuthorId = p.AuthorPostId,
                    AuthorUsername = p.AuthorPost.DisplayName,
                    UploadedAt = p.UploadedAt,
                    MediaPreviewUrl = p.Uploads
                        .Select(u => u.Media.Path)
                        .FirstOrDefault(),
                    MediaMimeType = p.Uploads
                        .Select(u => u.Media.MimeType)
                        .FirstOrDefault(),
                    LikeCount = p.Likes.Count(),

                    IsLikedByCurrentUser =
                        p.Likes.Any(l => l.UserId == currentUserId),
                    
                    IsFavorite = p.Favorites.Any(f => f.UserId == currentUserId),

                    ReplyCount =
                        _context.Posts.Count(r => r.RepliedToId == p.Id),

                    RepostCount =
                        _context.Posts.Count(r => r.RepostOfId == p.Id)
                })
                .ToListAsync(ct);
        }
        
        public async Task<IReadOnlyList<PostFeedResponse>> GetTrendingAsync(
            Guid currentUserId,
            int page,
            int pageSize,
            CancellationToken ct)
        {
            var now = DateTime.UtcNow;

            int diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
            var startOfWeek = now.Date.AddDays(-diff);

            return await _context.Posts
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .Select(p => new
                {
                    Post = p,

                    WeeklyLikes = p.Likes
                        .Count(l => l.CreatedAt >= startOfWeek)
                })
                .OrderByDescending(x => x.WeeklyLikes)
                .ThenByDescending(x => x.Post.UploadedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new PostFeedResponse
                {
                    Id = x.Post.Id,
                    Title = x.Post.Title,
                    Content = x.Post.Content!,
                    AuthorId = x.Post.AuthorPostId,
                    AuthorUsername = x.Post.AuthorPost.DisplayName,
                    UploadedAt = x.Post.UploadedAt,

                    MediaPreviewUrl = x.Post.Uploads
                        .Select(u => u.Media.Path)
                        .FirstOrDefault(),

                    MediaMimeType = x.Post.Uploads
                        .Select(u => u.Media.MimeType)
                        .FirstOrDefault(),

                    LikeCount = x.Post.Likes.Count(),

                    IsLikedByCurrentUser =
                        x.Post.Likes.Any(l => l.UserId == currentUserId),

                    IsFavorite =
                        x.Post.Favorites.Any(f => f.UserId == currentUserId),

                    ReplyCount =
                        _context.Posts.Count(r => r.RepliedToId == x.Post.Id),

                    RepostCount =
                        _context.Posts.Count(r => r.RepostOfId == x.Post.Id)
                })
                .ToListAsync(ct);
        }
    }
}