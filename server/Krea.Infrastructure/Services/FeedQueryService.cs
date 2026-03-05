namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Feed;
    using Application.Features.Posts.Dto;
    using Data;
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
                    UploadedAt = p.UploadedAt,
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
                    UploadedAt = p.UploadedAt,

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