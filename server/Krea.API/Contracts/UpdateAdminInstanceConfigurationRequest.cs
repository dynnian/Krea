namespace Krea.API.Contracts {
    public sealed record UpdateAdminInstanceConfigurationRequest(
        string PlatformName,
        string Description,
        string AdministratorEmail
    );
}
