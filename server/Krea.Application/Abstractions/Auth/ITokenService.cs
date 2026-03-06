using Krea.Application.Abstractions.Identity;
using Krea.Domain.Entities;

namespace Krea.Application.Abstractions.Auth {
    public interface ITokenService {
        Task<TokenGenerationResult> GenerateAuthTokensAsync(UserIdentity userIdentity, Domain.Entities.User domainUser);
        Task<TokenGenerationResult?> RefreshAuthTokensAsync(string refreshToken);
        Task RevokeRefreshTokenAsync(string refreshToken);

    }
    public record TokenGenerationResult(
        string AccessToken, 
        DateTime AccessTokenExpiration, 
        string RefreshToken,
        Guid UserId);
}