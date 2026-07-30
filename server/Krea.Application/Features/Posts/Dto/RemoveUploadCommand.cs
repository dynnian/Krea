namespace Krea.Application.Features.Posts.Dto {
    public sealed record RemoveUploadCommand(
        Guid PostId,
        Guid MediaId
    );
}