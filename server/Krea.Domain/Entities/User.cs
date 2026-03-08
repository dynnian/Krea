using System.ComponentModel.DataAnnotations;
using Krea.Domain.Validators;

namespace Krea.Domain.Entities {
    public sealed class User {
        [Key] public Guid Id { get; private set; }

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

        public DateTime? LastLoginAt { get; private set; }
        public DateTime RegisteredAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }
        public DateTime? EmailConfirmedAt { get; private set; }
        public DateTime? LastPasswordResetAt { get; private set; }

        // Collections
        private readonly List<Post> _posts = new();
        public IReadOnlyCollection<Post> Posts => _posts;

        private readonly List<Like> _likes = new();
        public IReadOnlyCollection<Like> Likes => _likes;

        private readonly List<Collection> _collections = new();
        public IReadOnlyCollection<Collection> Collections => _collections;

        private readonly List<UserRole> _userRoles = new();
        public IReadOnlyCollection<UserRole> UserRoles => _userRoles.AsReadOnly();
        
        private readonly List<ConversationParticipant> _conversations = new();
        public IReadOnlyCollection<ConversationParticipant> Conversations => _conversations;

        #pragma warning disable CS8618
        private User() { }
        #pragma warning restore CS8618

        public User(
            string displayName,
            string languageCode,
            string timeZoneId,
            string? biography = null) {
            if (string.IsNullOrWhiteSpace(displayName))
                throw new ArgumentException("Display name is required");
            if (string.IsNullOrWhiteSpace(languageCode))
                throw new ArgumentException("Language code is required");
            if (string.IsNullOrWhiteSpace(timeZoneId))
                throw new ArgumentException("Time zone is required");

            Id = Guid.NewGuid();
            DisplayName = displayName;
            LanguageCode = languageCode;
            TimeZoneId = timeZoneId;
            Biography = biography ?? string.Empty;
            RegisteredAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            IsBanned = false;
            IsDisabled = false;
        }

        public void ConfirmEmail() {
            EmailConfirmed = true;
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

        public void SetLastLogin() {
            LastLoginAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetPasswordReset() {
            LastPasswordResetAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void AssignRole(Role role, Guid? assignedBy) {
            if (role is null)
                throw new ArgumentNullException(nameof(role));

            if (_userRoles.Any(r => r.RoleId == role.Id))
                throw new InvalidOperationException("El usuario ya posee este rol.");

            var userRole = new UserRole(Id, role.Id, assignedBy);

            _userRoles.Add(userRole);
        }

        public void RemoveRole(Guid roleId) {
            UserRole? existing = _userRoles.FirstOrDefault(r => r.RoleId == roleId);

            if (existing is null)
                throw new InvalidOperationException("El usuario no posee este rol.");

            _userRoles.Remove(existing);
        }

        public bool HasRole(string roleName) =>
            _userRoles.Any(r =>
                r.Role.Name.Equals(roleName, StringComparison.OrdinalIgnoreCase));

        public bool HasRole(Guid roleId) => _userRoles.Any(r => r.RoleId == roleId);
    }
}