namespace Krea.Application.Features.User {
    public sealed record PublicUserProfileResponse(
        Guid Id,
        string Username,
        string DisplayName,
        string? Biography,
        string LanguageCode,
        string TimeZoneId,
        int FollowersCount,
        int FollowingCount,
        string? ProfilePictureUrl
    );
}