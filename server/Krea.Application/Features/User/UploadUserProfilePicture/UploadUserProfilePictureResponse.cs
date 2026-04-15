namespace Krea.Application.Features.User.UploadUserProfilePicture {
    public sealed record UploadUserProfilePictureResponse(
        Guid MediaId,
        string FileName,
        string MimeType,
        string Url,
        long Size
    );
}