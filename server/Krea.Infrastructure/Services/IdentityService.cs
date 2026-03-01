using Krea.Application.Abstractions.Identity;
using Krea.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace Krea.Infrastructure.Services {
    public class IdentityService : IIdentityService {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public IdentityService(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager) {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<UserIdentity?> FindByIdAsync(Guid userId) {
            AppUser? appUser = await _userManager.FindByIdAsync(userId.ToString());
            return appUser == null ? null : await ToUserIdentity(appUser);
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