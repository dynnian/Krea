namespace Krea.Application.Features.Admin.Configuration {
    using Domain.Abstractions;

    public sealed record UpdateAdminInstanceConfigurationCommand(
        string PlatformName,
        string Description,
        string AdministratorEmail
    ) : IRequest<AdminInstanceConfigurationDto>;
}