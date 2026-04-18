namespace Krea.Application.Features.Admin.Configuration {
    public sealed record AdminInstanceConfigurationDto(
        string PlatformName,
        string Description,
        string AdministratorEmail
    );
}