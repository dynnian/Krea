namespace Krea.Application.Features.Posts.Dto {
    public sealed class RepliesResponse {
        public string Mode { get; init; }
        public PagedResponse<PostResponse>? Flat { get; init; }
        public List<ReplyNodeResponse>? Tree { get; init; }
    }
}