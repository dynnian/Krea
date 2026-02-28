namespace Krea.Application.Abstractions.Identity;

public interface IIdentityService
{
    Task<UserIdentity?> FindByUsernameAsync(string username);
    Task<UserIdentity?> FindByEmailAsync(string email);
    Task<UserIdentity?> FindByUsernameOrEmailAsync(string input);
    Task<bool> CheckPasswordAsync(UserIdentity user, string password);
    Task<(bool Succeeded, string[] Errors)> CreateUserAsync(UserIdentity user, string password);
    Task<IList<string>> GetRolesAsync(UserIdentity user);
}