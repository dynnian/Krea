namespace Krea.Application.Abstractions.Identity {
    public interface IIdentityService {
        Task<UserIdentity?> FindByIdAsync(Guid userId);
        Task<IReadOnlyDictionary<Guid, UserIdentity>> GetByIdsAsync(IReadOnlyCollection<Guid> userIds);

        Task<IReadOnlyList<UserIdentity>> SearchUsersAsync(string? search, string? role,
                                                           CancellationToken cancellationToken = default);

        Task<(bool Succeeded, string[] Errors)> SetUserRolesAsync(Guid userId, IReadOnlyCollection<string> roles);
        Task<IReadOnlyList<string>> GetAvailableRolesAsync();
        Task<int> CountUsersInRoleAsync(string role, CancellationToken cancellationToken = default);
        Task<UserIdentity?> FindByUsernameAsync(string username);
        Task<UserIdentity?> FindByEmailAsync(string email);
        Task<UserIdentity?> FindByUsernameOrEmailAsync(string input);
        Task<bool> CheckPasswordAsync(UserIdentity user, string password);
        Task<bool> ChangePasswordAsync(UserIdentity user, string currentPassword, string newPassword);
        Task<(bool Succeeded, string[] Errors)> CreateUserAsync(UserIdentity user, string password);
        Task<(bool Succeeded, string[] Errors)> DeleteUserAsync(Guid userId);
        Task<IList<string>> GetRolesAsync(UserIdentity user);
        Task<string> GenerateEmailConfirmationTokenAsync(UserIdentity user);
        Task<bool> ConfirmEmailAsync(UserIdentity user, string token);
    }
}