using Krea.Application.Features.User;

namespace Krea.Application.Features.Auth;

public record AuthResponse(string Token, DateTime Expiration, UserDto User);