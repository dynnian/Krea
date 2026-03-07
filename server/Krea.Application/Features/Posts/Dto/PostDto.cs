namespace Krea.Application.Features.Posts.Dto {
    using Domain.Entities;

    public sealed class PostDto
    {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        
        public string AuthorUsername { get; init; } = string.Empty;

        public string Title { get; init; } = default!;

        public string? Content { get; init; }

        public DateTime CreatedAt { get; init; }

        public IReadOnlyList<PostMediaDto> Media { get; init; } = [];

        public static PostDto FromDomain(Post post)
        {
            return new PostDto
            {
                Id = post.Id,
                UserId = post.AuthorPostId,
                AuthorUsername = post.AuthorPost.DisplayName,
                Title = post.Title,
                Content = post.Content,
                CreatedAt = post.UploadedAt,

                Media = post.Uploads
                    .Select(upload => new PostMediaDto
                    {
                        Id = upload.Media.Id,
                        FileName = upload.Media.FileName,
                        MimeType = upload.Media.MimeType,
                        Url = upload.Media.Path,
                        IsWorkMedia = upload.IsWorkMedia
                    })
                    .ToList()
            };
        }
    }
}