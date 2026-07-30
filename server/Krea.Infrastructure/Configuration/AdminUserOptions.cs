namespace Krea.Infrastructure.Configuration {
    public sealed class AdminUserOptions {
        public string Email { get; init; } = string.Empty;
        public string Username { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
        public string DisplayName { get; init; } = "Admin";
    }
}