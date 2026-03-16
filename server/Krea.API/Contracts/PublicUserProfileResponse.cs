namespace Krea.API.Contracts {
    public sealed record PublicUserProfileResponse(
        Guid Id,
        string Username,
        string DisplayName,
        string? Biography,
        string LanguageCode,
        string TimeZoneId
    );
}