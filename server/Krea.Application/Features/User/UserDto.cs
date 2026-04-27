namespace Krea.Application.Features.User {
    public record UserDto(
        Guid Id,
        string Username,
        string Email,
        string DisplayName,
        string? Biography,
        string LanguageCode,
        string TimeZoneId,
        int RoleId,
        string? ProfilePictureUrl = null);
}