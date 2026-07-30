namespace Krea.Application.Features.Posts.DeletePost {
    using Domain.Abstractions;

    public sealed record DeletePostCommand(Guid PostId)
        : IRequest<DeletePostResponse>;
}