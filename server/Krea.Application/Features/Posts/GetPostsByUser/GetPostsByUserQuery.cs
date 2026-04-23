namespace Krea.Application.Features.Posts.GetPostsByUser {
    using Domain.Abstractions;
    using Dto;

    public sealed record GetPostsByUserQuery(
        Guid AuthorPostId,
        int Page,
        int PageSize,
        Guid? CurrentUserId
    ) : IRequest<IReadOnlyList<PostDtoV2>>;
}