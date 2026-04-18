namespace Krea.Application.Features.Posts.ReplyPost.GetReplies {
    using Abstractions;
    using Domain.Abstractions;
    using Dto;

    public sealed record GetRepliesQuery(
        Guid PostId,
        int Page,
        int PageSize,
        ReplyMode Mode // "flat" | "tree"
    ) : IRequest<RepliesResponse>;
}