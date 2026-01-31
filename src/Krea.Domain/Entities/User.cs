namespace Krea.Domain.Entities {
    public sealed class User {
        public int Id { get; private set; }
        public string Username { get; private set; }
        public string Email { get; private set; }
        public bool EmailConfirmed { get; private set; }
        public string DisplayName { get; private set; }
        public string PasswordHash { get; private set; }
        public Media? ProfilePicture { get; private set; }
        public Media? BannerPicture { get; private set; }
    }
}