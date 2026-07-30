namespace Krea.Application.Features.Posts.GetPostById {
    using Domain.Abstractions;

    public sealed record GetPostByIdCommand(
        Guid PostId,
        Guid? CurrentUserId)
        : IRequest<GetPostByIdResponse?>;
}