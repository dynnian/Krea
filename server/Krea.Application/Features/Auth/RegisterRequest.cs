namespace Krea.Application.Features.Auth;

public record RegisterRequest(
    string Username,
    string Email,
    string Password,
    string DisplayName,
    string LanguageCode,
    string TimeZoneId,
    string? Biography);