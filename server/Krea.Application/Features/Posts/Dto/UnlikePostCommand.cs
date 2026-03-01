namespace Krea.Application.Features.Posts.Dto {
    public sealed record UnlikePostCommand(
        Guid PostId,
        Guid UserId
    );
}