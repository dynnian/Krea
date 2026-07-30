namespace Krea.Application.Features.Auth.RevokeToken {
    using Domain.Abstractions;

    public record RevokeTokenCommand(string RefreshToken) : IRequest<bool>;
}