namespace Krea.Application.Features.User.UploadUserProfilePicture {
    using Domain.Abstractions;

    public sealed record UploadUserProfilePictureCommand(
        Guid UserId,
        string FileName,
        string ContentType,
        long FileSize,
        Stream Content
    ) : IRequest<UploadUserProfilePictureResponse>;
}