using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class InstanceConfiguration {
        [Key] public Guid Id { get; private set; }

        [StringLength(128)] public string PlatformName { get; private set; }

        [StringLength(512)] public string Description { get; private set; }

        [StringLength(256)] public string AdministratorEmail { get; private set; }

        public DateTime UpdatedAt { get; private set; }

#pragma warning disable CS8618
        private InstanceConfiguration() { }
#pragma warning restore CS8618

        public InstanceConfiguration(string platformName, string description, string administratorEmail) {
            Validate(platformName, description, administratorEmail);

            Id = Guid.NewGuid();
            PlatformName = platformName;
            Description = description;
            AdministratorEmail = administratorEmail;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Update(string platformName, string description, string administratorEmail) {
            Validate(platformName, description, administratorEmail);

            PlatformName = platformName;
            Description = description;
            AdministratorEmail = administratorEmail;
            UpdatedAt = DateTime.UtcNow;
        }

        private static void Validate(string platformName, string description, string administratorEmail) {
            if (string.IsNullOrWhiteSpace(platformName))
                throw new ArgumentException("Platform name is required.");

            if (platformName.Length > 128)
                throw new ArgumentException("Platform name cannot exceed 128 characters.");

            if ((description ?? string.Empty).Length > 512)
                throw new ArgumentException("Description cannot exceed 512 characters.");

            if (string.IsNullOrWhiteSpace(administratorEmail))
                throw new ArgumentException("Administrator email is required.");

            if (administratorEmail.Length > 256)
                throw new ArgumentException("Administrator email cannot exceed 256 characters.");

            if (!administratorEmail.Contains('@'))
                throw new ArgumentException("Administrator email must be valid.");
        }
    }
}