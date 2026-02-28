namespace Krea.Application.Features.Posts.GetAllPosts {
    using Domain.Abstractions;
    using Dto;

    public sealed record GetAllPostsQuery(
        int Page,
        int PageSize
    ) : IRequest<IReadOnlyList<PostDto>>;}