using Krea.Application.Abstractions.Identity;
using Krea.Infrastructure.Data;
using Krea.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Services {
    public class IdentityService : IIdentityService {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly AppDbContext _context;

        public IdentityService(
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            AppDbContext context) {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<UserIdentity?> FindByIdAsync(Guid userId) {
            AppUser? appUser = await _userManager.FindByIdAsync(userId.ToString());
            return appUser == null ? null : await ToUserIdentity(appUser);
        }

        public async Task<IReadOnlyDictionary<Guid, UserIdentity>> GetByIdsAsync(IReadOnlyCollection<Guid> userIds) {
            if (userIds.Count == 0)
                return new Dictionary<Guid, UserIdentity>();

            List<AppUser> appUsers = await _userManager.Users
                                                       .Where(u => userIds.Contains(u.Id))
                                                       .ToListAsync();

            var result = new Dictionary<Guid, UserIdentity>(appUsers.Count);
            foreach (AppUser appUser in appUsers) {
                UserIdentity identity = await ToUserIdentity(appUser);
                result[identity.Id] = identity;
            }

            return result;
        }

        public async Task<IReadOnlyList<UserIdentity>> SearchUsersAsync(
            string? search,
            string? role,
            CancellationToken cancellationToken = default) {
            IQueryable<AppUser> query = _userManager.Users.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search)) {
                string normalized = search.Trim().ToLowerInvariant();
                query = query.Where(u =>
                    u.UserName != null && u.UserName.ToLower().Contains(normalized) ||
                    u.Email != null && u.Email.ToLower().Contains(normalized));
            }

            if (!string.IsNullOrWhiteSpace(role)) {
                string normalizedRole = role.Trim().ToUpperInvariant();

                query = from user in query
                        join userRole in _context.UserRoles on user.Id equals userRole.UserId
                        join identityRole in _context.Roles on userRole.RoleId equals identityRole.Id
                        where identityRole.NormalizedName == normalizedRole
                        select user;
            }

            List<AppUser> users = await query.OrderBy(u => u.UserName)
                                             .ToListAsync(cancellationToken);

            var result = new List<UserIdentity>(users.Count);
            foreach (AppUser user in users) {
                result.Add(await ToUserIdentity(user));
            }

            return result;
        }

        public async Task<(bool Succeeded, string[] Errors)> SetUserRolesAsync(
            Guid userId,
            IReadOnlyCollection<string> roles) {
            AppUser? appUser = await _userManager.FindByIdAsync(userId.ToString());
            if (appUser is null)
                return (false, ["User not found."]);

            List<string> normalizedRoles = roles
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Select(r => r.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (normalizedRoles.Count == 0)
                return (false, ["At least one role is required."]);

            foreach (string role in normalizedRoles) {
                bool roleExists = await _roleManager.RoleExistsAsync(role);
                if (!roleExists)
                    return (false, [$"Role '{role}' does not exist."]);
            }

            IList<string> currentRoles = await _userManager.GetRolesAsync(appUser);

            IdentityResult removeResult = await _userManager.RemoveFromRolesAsync(appUser, currentRoles);
            if (!removeResult.Succeeded)
                return (false, removeResult.Errors.Select(e => e.Description).ToArray());

            IdentityResult addResult = await _userManager.AddToRolesAsync(appUser, normalizedRoles);
            if (!addResult.Succeeded)
                return (false, addResult.Errors.Select(e => e.Description).ToArray());

            return (true, Array.Empty<string>());
        }

        public async Task<IReadOnlyList<string>> GetAvailableRolesAsync() =>
            await _roleManager.Roles
                              .AsNoTracking()
                              .Select(r => r.Name!)
                              .OrderBy(r => r)
                              .ToListAsync();

        public async Task<int> CountUsersInRoleAsync(string role, CancellationToken cancellationToken = default) {
            if (string.IsNullOrWhiteSpace(role))
                return 0;

            string normalizedRole = role.Trim().ToUpperInvariant();

            return await (from userRole in _context.UserRoles
                          join identityRole in _context.Roles on userRole.RoleId equals identityRole.Id
                          where identityRole.NormalizedName == normalizedRole
                          select userRole)
                         .CountAsync(cancellationToken);
        }

        public async Task<UserIdentity?> FindByUsernameAsync(string username) {
            AppUser? appUser = await _userManager.FindByNameAsync(username);
            return appUser == null ? null : await ToUserIdentity(appUser);
        }

        public async Task<UserIdentity?> FindByEmailAsync(string email) {
            AppUser? appUser = await _userManager.FindByEmailAsync(email);
            return appUser == null ? null : await ToUserIdentity(appUser);
        }

        public async Task<UserIdentity?> FindByUsernameOrEmailAsync(string input) {
            AppUser? appUser = await _userManager.FindByNameAsync(input);
            if (appUser == null)
                appUser = await _userManager.FindByEmailAsync(input);
            return appUser == null ? null : await ToUserIdentity(appUser);
        }

        public async Task<bool> CheckPasswordAsync(UserIdentity user, string password) {
            AppUser? appUser = await _userManager.FindByIdAsync(user.Id.ToString());
            if (appUser == null) return false;
            SignInResult result = await _signInManager.CheckPasswordSignInAsync(appUser, password, false);
            return result.Succeeded;
        }
        
        public async Task<bool> ChangePasswordAsync(UserIdentity user, string currentPassword, string newPassword)
        {
            var appUser = await _userManager.FindByIdAsync(user.Id.ToString());
            if (appUser == null) return false;
            var result = await _userManager.ChangePasswordAsync(appUser, currentPassword, newPassword);
            return result.Succeeded;
        }

        public async Task<(bool Succeeded, string[] Errors)> CreateUserAsync(UserIdentity user, string password) {
            var appUser = new AppUser { Id = user.Id, UserName = user.UserName, Email = user.Email };
            IdentityResult result = await _userManager.CreateAsync(appUser, password);
            if (!result.Succeeded)
                return (false, result.Errors.Select(e => e.Description).ToArray());

            // Optionally assign roles if provided
            foreach (string role in user.Roles) {
                await _userManager.AddToRoleAsync(appUser, role);
            }

            return (true, Array.Empty<string>());
        }

        public async Task<(bool Succeeded, string[] Errors)> DeleteUserAsync(Guid userId) {
            AppUser? appUser = await _userManager.FindByIdAsync(userId.ToString());
            if (appUser is null)
                return (false, ["User not found."]);

            IdentityResult result = await _userManager.DeleteAsync(appUser);
            if (!result.Succeeded)
                return (false, result.Errors.Select(e => e.Description).ToArray());

            return (true, Array.Empty<string>());
        }

        public async Task<IList<string>> GetRolesAsync(UserIdentity user) {
            AppUser? appUser = await _userManager.FindByIdAsync(user.Id.ToString());
            if (appUser == null) return new List<string>();
            return await _userManager.GetRolesAsync(appUser);
        }

        // Helper to convert AppUser to UserIdentity
        private async Task<UserIdentity> ToUserIdentity(AppUser appUser) {
            IList<string> roles = await _userManager.GetRolesAsync(appUser);
            return new UserIdentity(
                appUser.Id,
                appUser.UserName!,
                appUser.Email!,
                roles
            );
        }

        public async Task<string> GenerateEmailConfirmationTokenAsync(UserIdentity user) {
            AppUser? appUser = await _userManager.FindByIdAsync(user.Id.ToString());
            if (appUser == null) throw new Exception("User not found");
            return await _userManager.GenerateEmailConfirmationTokenAsync(appUser);
        }

        public async Task<bool> ConfirmEmailAsync(UserIdentity user, string token) {
            AppUser? appUser = await _userManager.FindByIdAsync(user.Id.ToString());
            if (appUser == null) return false;
            IdentityResult result = await _userManager.ConfirmEmailAsync(appUser, token);
            return result.Succeeded;
        }
    }
}