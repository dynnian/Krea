using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Krea.Application.Abstractions.Auth;
using Krea.Application.Abstractions.Identity;
using Krea.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Krea.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task<(string Token, DateTime Expiration)> GenerateTokenAsync(UserIdentity userIdentity, User domainUser)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userIdentity.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, userIdentity.UserName),
            new Claim(JwtRegisteredClaimNames.Email, userIdentity.Email),
            new Claim("displayName", domainUser.DisplayName)
        };

        // Add roles
        claims.AddRange(userIdentity.Roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiration = DateTime.UtcNow.AddHours(2);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiration,
            signingCredentials: creds);

        return Task.FromResult((new JwtSecurityTokenHandler().WriteToken(token), expiration));
    }
}