namespace Krea.Application.Features.Posts.Dto {
    using Domain.Entities;

    public sealed class PostDto {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public string? Content { get; init; }
        public DateTime CreatedAt { get; init; }

        public static PostDto FromDomain(Post post) =>
            new() { Id = post.Id, UserId = post.AuthorPostId, Content = post.Content, CreatedAt = post.UploadedAt };
    }
}