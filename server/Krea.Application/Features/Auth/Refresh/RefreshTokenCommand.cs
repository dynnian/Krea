namespace Krea.Application.Features.Auth.Refresh {
    using Domain.Abstractions;

    public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponse?>;
}