namespace Krea.Application.Features.User {
    public sealed record UserProfileDto(
        Guid Id,
        string Username,
        string Email,
        string DisplayName,
        string? Biography,
        string LanguageCode,
        string TimeZoneId,
        int RoleId,
        int FollowersCount,
        int FollowingCount,
        string? ProfilePictureUrl,
        string? BannerPictureUrl
    );
}