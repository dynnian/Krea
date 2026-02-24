namespace Krea.Application.Features.Auth;

public record LoginRequest(string EmailOrUsername, string Password);