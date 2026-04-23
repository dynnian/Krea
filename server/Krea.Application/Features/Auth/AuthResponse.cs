namespace Krea.Application.Features.Auth {
    using User;

    public record AuthResponse(string Token, DateTime Expiration, string RefreshToken, UserDto User);
}