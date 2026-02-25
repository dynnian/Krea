using System.ComponentModel.DataAnnotations;
using Krea.Domain.Validators;

namespace Krea.Domain.Entities
{
    public sealed class User
    {
        public Guid Id { get; private set; }
        
        [StringLength(32), Required]
        public string DisplayName { get; private set; }

        [StringLength(256)]
        public string Biography { get; private set; }

        [LanguageCode]
        public string LanguageCode { get; set; }

        [TimeZone]
        public string TimeZoneId { get; set; }

        public bool IsBanned { get; private set; }
        public bool IsDisabled { get; private set; }

        public Media? ProfilePicture { get; private set; }
        public Media? BannerPicture { get; private set; }

        public DateTime? LastLoginAt { get; private set; }
        public DateTime RegisteredAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        // Colecciones
        private readonly List<Post> _posts = new();
        public IReadOnlyCollection<Post> Posts => _posts;

        private readonly List<Like> _likes = new();
        public IReadOnlyCollection<Like> Likes => _likes;

        private readonly List<Collections> _collections = new();
        public IReadOnlyCollection<Collections> Collections => _collections;

        #pragma warning disable CS8618
        private User() { }
        #pragma warning restore CS8618

        public User(
            string displayName,
            string languageCode,
            string timeZoneId,
            string? biography = null)
        {
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
        
        public void Ban()
        {
            IsBanned = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Unban()
        {
            IsBanned = false;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Disable()
        {
            IsDisabled = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Enable()
        {
            IsDisabled = false;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateProfilePicture(Media profilePicture)
        {
            ProfilePicture = profilePicture ?? throw new ArgumentNullException(nameof(profilePicture));
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateBannerPicture(Media bannerPicture)
        {
            BannerPicture = bannerPicture ?? throw new ArgumentNullException(nameof(bannerPicture));
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateBiography(string biography)
        {
            Biography = biography ?? string.Empty;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateDisplayName(string displayName)
        {
            if (string.IsNullOrWhiteSpace(displayName))
                throw new ArgumentException("Display name is required");
            DisplayName = displayName;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetLastLogin()
        {
            LastLoginAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}