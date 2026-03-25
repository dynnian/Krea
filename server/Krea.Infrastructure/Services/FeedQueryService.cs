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
            Guid currentUserId,
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
            var since = DateTime.UtcNow.AddDays(-3);

            return await _context.Posts
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .OrderByDescending(p =>
                    p.Likes.Count(l => l.CreatedAt >= since)
                )
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

                    ReplyCount =
                        _context.Posts.Count(r => r.RepliedToId == p.Id),

                    RepostCount =
                        _context.Posts.Count(r => r.RepostOfId == p.Id)
                })
                .ToListAsync(ct);
        }
    }
}