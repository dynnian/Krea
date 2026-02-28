using Krea.Application.Abstractions.Identity;
using Krea.Domain.Entities;

namespace Krea.Application.Abstractions.Auth;

public interface ITokenService
{
    Task<(string Token, DateTime Expiration)> GenerateTokenAsync(UserIdentity userIdentity, User domainUser);
}