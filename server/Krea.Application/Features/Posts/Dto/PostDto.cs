namespace Krea.Application.Features.Posts.Dto {
    using Krea.Domain.Entities;

    public sealed class PostDto {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public string? Content { get; init; }
        public DateTime CreatedAt { get; init; }

        public static PostDto FromDomain(Post post) {
            return new PostDto {
                Id = post.Id, UserId = post.AuthorPostId, Content = post.Content, CreatedAt = post.UploadedAt,
            };
        }
    }
}