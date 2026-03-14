namespace Krea.Application.Features.Posts.GetPostsByUser {
    using Domain.Abstractions;
    using Dto;

    public sealed record GetPostsByUserQuery(
        Guid AuthorPostId,
        int Page,
        int PageSize
    ) : IRequest<IReadOnlyList<PostDto>>;
}