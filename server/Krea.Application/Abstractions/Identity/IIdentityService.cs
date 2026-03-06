namespace Krea.Application.Abstractions.Identity {
    public interface IIdentityService {
        Task<UserIdentity?> FindByIdAsync(Guid userId);
        Task<UserIdentity?> FindByUsernameAsync(string username);
        Task<UserIdentity?> FindByEmailAsync(string email);
        Task<UserIdentity?> FindByUsernameOrEmailAsync(string input);
        Task<bool> CheckPasswordAsync(UserIdentity user, string password);
        Task<bool> ChangePasswordAsync(UserIdentity user, string currentPassword, string newPassword);
        Task<(bool Succeeded, string[] Errors)> CreateUserAsync(UserIdentity user, string password);
        Task<IList<string>> GetRolesAsync(UserIdentity user);
        Task<string> GenerateEmailConfirmationTokenAsync(UserIdentity user);
        Task<bool> ConfirmEmailAsync(UserIdentity user, string token);
    }
}