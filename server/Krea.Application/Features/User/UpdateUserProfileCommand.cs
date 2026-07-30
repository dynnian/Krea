namespace Krea.Application.Features.User {
    using Domain.Abstractions;

    public sealed record UpdateUserProfileCommand(
        Guid UserId,
        string? DisplayName,
        bool DisplayNameIsSet,
        string? Biography,
        bool BiographyIsSet,
        string? LanguageCode,
        bool LanguageCodeIsSet,
        string? TimeZoneId,
        bool TimeZoneIdIsSet,
        Guid? ProfilePictureId,
        bool ProfilePictureIdIsSet,
        Guid? BannerPictureId,
        bool BannerPictureIdIsSet
    ) : IRequest<UserDto>;
}