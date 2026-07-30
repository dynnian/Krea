namespace Krea.Application.Features.Auth.RevokeToken {
    using Abstractions.Auth;
    using Domain.Abstractions;

    internal class RevokeTokenCommandHandler(ITokenService tokenService) : IRequestHandler<RevokeTokenCommand, bool> {
        public async Task<bool> Handle(RevokeTokenCommand request, CancellationToken cancellationToken) {
            await tokenService.RevokeRefreshTokenAsync(request.RefreshToken);
            return true;
        }
    }
}