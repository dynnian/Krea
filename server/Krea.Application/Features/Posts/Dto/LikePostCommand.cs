namespace Krea.Application.Features.Posts.Dto {
    public sealed record LikePostCommand(
        Guid PostId,
        Guid UserId
    );
}