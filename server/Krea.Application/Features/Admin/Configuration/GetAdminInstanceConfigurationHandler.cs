namespace Krea.Application.Features.Admin.Configuration {
    using Abstractions.Admin;
    using Domain.Abstractions;

    public sealed class GetAdminInstanceConfigurationHandler
        : IRequestHandler<GetAdminInstanceConfigurationQuery, AdminInstanceConfigurationDto> {
        private readonly IInstanceSettingsService _instanceSettingsService;

        public GetAdminInstanceConfigurationHandler(IInstanceSettingsService instanceSettingsService) {
            _instanceSettingsService = instanceSettingsService;
        }

        public async Task<AdminInstanceConfigurationDto> Handle(
            GetAdminInstanceConfigurationQuery request,
            CancellationToken cancellationToken) {
            InstanceSettings settings = await _instanceSettingsService.GetAsync(cancellationToken);
            return new AdminInstanceConfigurationDto(
                settings.PlatformName,
                settings.Description,
                settings.AdministratorEmail);
        }
    }
}
