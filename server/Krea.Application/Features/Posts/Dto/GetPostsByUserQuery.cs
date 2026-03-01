namespace Krea.Application.Features.Posts.Dto {
    using Domain.Abstractions;

    public sealed record GetPostsByUserQuery(
        Guid AuthorPostId,
        int Page,
        int PageSize
    ) : IRequest<IReadOnlyList<PostDto>>;
}