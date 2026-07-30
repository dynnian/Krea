namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Auth;
    using Application.Abstractions.Identity;
    using Configuration;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.Extensions.Options;
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Security.Cryptography;
    using System.Text;

    public class TokenService(
        IOptions<JwtOptions> jwtOptions,
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork,
        IUserRepository userRepository,
        IIdentityService identityService)
        : ITokenService {
        private readonly JwtOptions _jwtOptions = jwtOptions.Value;

        private string GenerateAccessToken(UserIdentity userIdentity, User domainUser, out DateTime expires) {
            var claims = new List<Claim> {
                new(JwtRegisteredClaimNames.Sub, userIdentity.Id.ToString()),
                new(JwtRegisteredClaimNames.UniqueName, userIdentity.UserName),
                new(JwtRegisteredClaimNames.Email, userIdentity.Email),
                new("displayName", domainUser.DisplayName)
            };

            // Agregar roles
            claims.AddRange(userIdentity.Roles.Select(role => new Claim(ClaimTypes.Role, role)));

            string signingKey = GetRequiredOptionValue(_jwtOptions.Key, "Jwt:Key");
            string issuer = GetRequiredOptionValue(_jwtOptions.Issuer, "Jwt:Issuer");
            string audience = GetRequiredOptionValue(_jwtOptions.Audience, "Jwt:Audience");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            int accessTokenHours = _jwtOptions.AccessTokenHours <= 0 ? 2 : _jwtOptions.AccessTokenHours;
            expires = DateTime.UtcNow.AddHours(accessTokenHours);

            var token = new JwtSecurityToken(
                issuer,
                audience,
                claims,
                expires: expires,
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken() {
            byte[] randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<TokenGenerationResult> GenerateAuthTokensAsync(UserIdentity userIdentity, User domainUser) {
            // Generar Access Token y Refresh Token
            string accessToken = GenerateAccessToken(userIdentity, domainUser, out DateTime accessTokenExpires);

            string refreshTokenString = GenerateRefreshToken();
            int refreshTokenDays = _jwtOptions.RefreshTokenDays <= 0 ? 7 : _jwtOptions.RefreshTokenDays;
            DateTime refreshTokenExpires = DateTime.UtcNow.AddDays(refreshTokenDays);

            // Persistir Refresh Token
            var refreshTokenEntity = new RefreshToken(refreshTokenString, userIdentity.Id, refreshTokenExpires);
            refreshTokenRepository.Add(refreshTokenEntity);

            await unitOfWork.SaveChangesAsync();

            return new TokenGenerationResult(accessToken, accessTokenExpires, refreshTokenString, userIdentity.Id);
        }

        public async Task<TokenGenerationResult?> RefreshAuthTokensAsync(string refreshToken) {
            RefreshToken? storedToken = await refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (storedToken == null || !storedToken.IsActive)
                return null;

            string newRefreshTokenString = GenerateRefreshToken();
            storedToken.MarkAsUsed(newRefreshTokenString);

            UserIdentity? userIdentity = await identityService.FindByIdAsync(storedToken.UserId);
            if (userIdentity == null)
                return null;

            User? domainUser = await userRepository.GetByIdAsync(storedToken.UserId);
            if (domainUser == null)
                return null;

            // Generate new access token
            string newAccessToken = GenerateAccessToken(userIdentity, domainUser, out DateTime newAccessTokenExpires);
            int refreshTokenDays = _jwtOptions.RefreshTokenDays <= 0 ? 7 : _jwtOptions.RefreshTokenDays;
            DateTime newRefreshTokenExpires = DateTime.UtcNow.AddDays(refreshTokenDays);

            // Generate new refresh token
            var newRefreshTokenEntity =
                new RefreshToken(newRefreshTokenString, storedToken.UserId, newRefreshTokenExpires);
            refreshTokenRepository.Add(newRefreshTokenEntity);

            refreshTokenRepository.Update(storedToken);
            await unitOfWork.SaveChangesAsync();

            return new TokenGenerationResult(newAccessToken, newAccessTokenExpires, newRefreshTokenString,
                storedToken.UserId);
        }

        public async Task RevokeRefreshTokenAsync(string refreshToken) {
            RefreshToken? storedToken = await refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (storedToken != null) {
                storedToken.Revoke();
                refreshTokenRepository.Update(storedToken);
                await unitOfWork.SaveChangesAsync();
            }
        }

        private static string GetRequiredOptionValue(string? value, string key) {
            if (string.IsNullOrWhiteSpace(value)) {
                throw new InvalidOperationException($"Missing required configuration value: {key}");
            }

            return value;
        }
    }
}