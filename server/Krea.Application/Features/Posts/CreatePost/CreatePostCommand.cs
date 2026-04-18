namespace Krea.Application.Features.Posts.CreatePost {
    using Domain.Abstractions;
    using Domain.ValueObjects;

    public sealed record CreatePostCommand(
        Guid AuthorPostId,
        PostType Type,
        string Title,
        string? Content,
        bool IsWork,
        bool IsLocal
        //IReadOnlyList<string>? Hashtags
    ) : IRequest<CreatePostResponse>;
}