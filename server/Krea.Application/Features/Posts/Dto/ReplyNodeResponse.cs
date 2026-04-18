namespace Krea.Application.Features.Posts.Dto {
    public sealed class ReplyNodeResponse {
        public Guid Id { get; init; }
        public Guid AuthorId { get; init; }
        public string AuthorName { get; init; } = string.Empty;
        public string Content { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }

        public List<ReplyNodeResponse> Replies { get; init; } = new();
    }
}