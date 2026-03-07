namespace Krea.Infrastructure.Services {
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Security.Cryptography;
    using System.Text;
    using Microsoft.Extensions.Configuration;
    using Microsoft.IdentityModel.Tokens;
    using Application.Abstractions.Auth;
    using Application.Abstractions.Identity;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.Abstractions;

    public class TokenService(
        IConfiguration configuration,
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork,
        IUserRepository userRepository,
        IIdentityService identityService)
        : ITokenService {

        private string GenerateAccessToken(UserIdentity userIdentity, User domainUser, out DateTime expires)
        {
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, userIdentity.Id.ToString()),
                new(JwtRegisteredClaimNames.UniqueName, userIdentity.UserName),
                new(JwtRegisteredClaimNames.Email, userIdentity.Email),
                new("displayName", domainUser.DisplayName)
            };

            // Agregar roles
            claims.AddRange(userIdentity.Roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            expires = DateTime.UtcNow.AddHours(2);

            var token = new JwtSecurityToken(
                configuration["Jwt:Issuer"],
                configuration["Jwt:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<TokenGenerationResult> GenerateAuthTokensAsync(UserIdentity userIdentity, User domainUser)
        {
            // Generar Access Token y Refresh Token
            string accessToken = GenerateAccessToken(userIdentity, domainUser, out var accessTokenExpires);
            
            string refreshTokenString = GenerateRefreshToken();
            DateTime refreshTokenExpires = DateTime.UtcNow.AddDays(7);

            // Persistir Refresh Token
            var refreshTokenEntity = new RefreshToken(refreshTokenString, userIdentity.Id, refreshTokenExpires);
            refreshTokenRepository.Add(refreshTokenEntity);

            await unitOfWork.SaveChangesAsync();

            return new TokenGenerationResult(accessToken, accessTokenExpires, refreshTokenString, userIdentity.Id);
        }

        public async Task<TokenGenerationResult?> RefreshAuthTokensAsync(string refreshToken)
        {
            RefreshToken? storedToken = await refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (storedToken == null || !storedToken.IsActive)
                return null;
            
            string newRefreshTokenString = GenerateRefreshToken();
            storedToken.MarkAsUsed(newRefreshTokenString);
            
            UserIdentity? userIdentity = await identityService.FindByIdAsync(storedToken.UserId);
            if (userIdentity == null) return null;

            User? domainUser = await userRepository.GetByIdAsync(storedToken.UserId);
            if (domainUser == null) return null;
            
            // Generate new access token
            string newAccessToken = GenerateAccessToken(userIdentity, domainUser, out var newAccessTokenExpires);
            DateTime newRefreshTokenExpires = DateTime.UtcNow.AddDays(7);

            // Generate new refresh token
            var newRefreshTokenEntity = new RefreshToken(newRefreshTokenString, storedToken.UserId, newRefreshTokenExpires);
            refreshTokenRepository.Add(newRefreshTokenEntity);
            
            refreshTokenRepository.Update(storedToken);
            await unitOfWork.SaveChangesAsync();

            return new TokenGenerationResult(newAccessToken, newAccessTokenExpires, newRefreshTokenString, storedToken.UserId);
        }

        public async Task RevokeRefreshTokenAsync(string refreshToken)
        {
            RefreshToken? storedToken = await refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (storedToken != null)
            {
                storedToken.Revoke();
                refreshTokenRepository.Update(storedToken);
                await unitOfWork.SaveChangesAsync();
            }
        }
    }
}