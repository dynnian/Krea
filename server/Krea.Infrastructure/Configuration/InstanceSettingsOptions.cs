namespace Krea.Infrastructure.Configuration {
    public sealed class InstanceSettingsOptions {
        public string PlatformName { get; set; } = "Krea";
        public string Description { get; set; } = "A federated platform for artists and creators";
        public string AdministratorEmail { get; set; } = "admin@krea.local";
    }
}