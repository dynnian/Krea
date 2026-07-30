namespace Krea.Application.Features.Posts.Dto {
    using Domain.Entities;

    public class PostDtoV2 {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public string AuthorUsername { get; init; } = string.Empty;
        public string Title { get; init; } = default!;
        public string? Content { get; init; }
        public DateTime CreatedAt { get; init; }

        public int LikesCount { get; init; }
        public bool IsLikedByCurrentUser { get; init; }
        public bool IsRetweetedByCurrentUser { get; init; }
        public bool IsFavorite { get; init; }

        public IReadOnlyList<string> Genres { get; init; } = [];

        public IReadOnlyList<PostMediaDtoV2> Media { get; init; } = [];

        public static PostDtoV2 FromDomain(
            Post post,
            bool isLikedByCurrentUser,
            bool isRetweetedByCurrentUser,
            bool isFavorite) =>
            new() {
                Id = post.Id,
                UserId = post.AuthorPostId,
                AuthorUsername = post.AuthorPost?.DisplayName ?? "Unknown",
                Title = post.Title,
                Content = post.Content,
                CreatedAt = post.UploadedAt,
                LikesCount = post.Likes.Count,
                IsLikedByCurrentUser = isLikedByCurrentUser,
                IsRetweetedByCurrentUser = isRetweetedByCurrentUser,
                IsFavorite = isFavorite,
                Genres = post.Uploads?
                             .Where(u => u.Metadata != null)
                             .SelectMany(u => u.Metadata!.Genres)
                             .Select(g => g.Name)
                             .Distinct()
                             .ToList() ?? [],
                Media = post.Uploads?
                            .Where(u => u.Media != null)
                            .Select(upload => new PostMediaDtoV2 {
                                Id = upload.Id,
                                FileName = upload.Media.FileName,
                                MimeType = upload.Media.MimeType,
                                Url = upload.Media.Path,
                                IsWorkMedia = upload.IsWorkMedia,
                                CoverMediaId = upload.CoverMediaId,
                                CoverUrl = upload.CoverMedia?.Path,
                                CoverMimeType = upload.CoverMedia?.MimeType,
                                Genres = upload.Metadata?.Genres
                                               .Select(g => g.Name)
                                               .Distinct()
                                               .ToList() ?? []
                            })
                            .ToList() ?? []
            };
    }
}