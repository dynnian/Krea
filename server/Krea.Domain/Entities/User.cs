using System.ComponentModel.DataAnnotations;
using Krea.Domain.Validators;

namespace Krea.Domain.Entities {
    public sealed class User {
        [Key] public Guid Id { get; private set; }

        [UserName]
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; private set; }

        [EmailAddress]
        [Required(ErrorMessage = "Email is required.")]
        public string Email { get; private set; }

        [Required(ErrorMessage = "PasswordHash is required.")]
        public string PasswordHash { get; private set; }

        [StringLength(32)]
        [Required(ErrorMessage = "DisplayName is required.")]
        public string DisplayName { get; private set; }

        [StringLength(256)] public string Biography { get; private set; }

        [LanguageCode] public string LanguageCode { get; set; }

        [TimeZone] public string TimeZoneId { get; set; }

        public bool EmailConfirmed { get; private set; }

        public bool IsBanned { get; private set; }

        public bool IsDisabled { get; private set; }

        public Media? ProfilePicture { get; private set; }
        public Guid? ProfilePictureId { get; private set; }

        public Media? BannerPicture { get; private set; }
        public Guid? BannerPictureId { get; private set; }

        public DateTime? EmailConfirmedAt { get; private set; }

        public DateTime? LastPasswordResetAt { get; private set; }

        private readonly List<Post> _posts = new();
        public IReadOnlyCollection<Post> Posts => _posts.AsReadOnly();

        private readonly List<Like> _likes = new();
        public IReadOnlyCollection<Like> Likes => _likes.AsReadOnly();

        private readonly List<Collection> _collections = new();
        public IReadOnlyCollection<Collection> Collections => _collections.AsReadOnly();

        public DateTime? LastLoginAt { get; private set; }

        public DateTime RegisteredAt { get; private set; }

        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private User() { }
        #pragma warning restore CS8618

        public User(
            string username,
            string email,
            string passwordHash,
            string displayName,
            string languageCode,
            string timeZoneId,
            string? biography) {
            if (string.IsNullOrWhiteSpace(username)
                || string.IsNullOrWhiteSpace(email)
                || string.IsNullOrWhiteSpace(passwordHash)
                || string.IsNullOrWhiteSpace(displayName)
                || string.IsNullOrWhiteSpace(languageCode)
                || string.IsNullOrWhiteSpace(timeZoneId))
                throw new ArgumentException("Required arguments are missing");
            Id = Guid.NewGuid();
            Username = username;
            Email = email.Trim().ToLowerInvariant();
            PasswordHash = passwordHash;
            DisplayName = displayName;
            LanguageCode = languageCode;
            TimeZoneId = timeZoneId;
            EmailConfirmed = false;
            IsBanned = false;
            IsDisabled = false;
            Biography = biography ?? string.Empty;
            RegisteredAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public User Load(
            Guid id,
            string username,
            string email,
            string passwordHash,
            string displayName,
            string biography,
            string languageCode,
            string timeZoneId,
            bool emailConfirmed,
            bool isBanned,
            bool isDisabled,
            Media? profilePicture,
            Media? bannerPicture,
            DateTime? emailConfirmedAt,
            DateTime? lastPasswordResetAt,
            DateTime? lastLoginAt,
            DateTime registeredAt,
            DateTime updatedAt) {
            if (string.IsNullOrWhiteSpace(username)
                || string.IsNullOrWhiteSpace(email)
                || string.IsNullOrWhiteSpace(passwordHash)
                || string.IsNullOrWhiteSpace(displayName)
                || string.IsNullOrWhiteSpace(languageCode)
                || string.IsNullOrWhiteSpace(timeZoneId))
                throw new ArgumentException("Required arguments are missing");
            var user = new User {
                Id = id,
                Username = username,
                Email = email,
                PasswordHash = passwordHash,
                DisplayName = displayName,
                Biography = biography,
                LanguageCode = languageCode,
                TimeZoneId = timeZoneId,
                EmailConfirmed = emailConfirmed,
                IsBanned = isBanned,
                IsDisabled = isDisabled,
                ProfilePicture = profilePicture,
                BannerPicture = bannerPicture,
                EmailConfirmedAt = emailConfirmedAt,
                LastPasswordResetAt = lastPasswordResetAt,
                LastLoginAt = lastLoginAt,
                RegisteredAt = registeredAt,
                UpdatedAt = updatedAt
            };
            return user;
        }

        public void ConfirmEmail() {
            EmailConfirmed = true;
            EmailConfirmedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateEmail(string newEmail) {
            if (string.IsNullOrWhiteSpace(newEmail))
                throw new ArgumentException("New email is required");
            Email = newEmail;
            EmailConfirmed = false;
            EmailConfirmedAt = null;
            UpdatedAt = DateTime.UtcNow;
        }

        public void ResetPassword(string newPasswordHash) {
            if (string.IsNullOrWhiteSpace(newPasswordHash))
                throw new ArgumentException("New password hash is required");
            PasswordHash = newPasswordHash;
            LastPasswordResetAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetLastLogin() {
            LastLoginAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Ban() {
            IsBanned = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Unban() {
            IsBanned = false;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Disable() {
            IsDisabled = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Enable() {
            IsDisabled = false;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateProfilePicture(Media profilePicture) {
            ProfilePicture = profilePicture;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateBannerPicture(Media bannerPicture) {
            BannerPicture = bannerPicture;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateBiography(string biography) {
            Biography = biography;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateDisplayName(string displayName) {
            if (string.IsNullOrWhiteSpace(displayName))
                throw new ArgumentException("Display name is required");
            DisplayName = displayName;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}