using Krea.Domain.Abstractions;

namespace Krea.Application.Features.Auth.Register {
    public record RegisterCommand(
        string Username,
        string Email,
        string Password,
        string DisplayName,
        string LanguageCode,
        string TimeZoneId,
        string? Biography
    ) : IRequest<AuthResponse>;
}