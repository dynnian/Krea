namespace Krea.Application.Features.Admin.Configuration {
    using Abstractions.Admin;
    using Domain.Abstractions;

    public sealed class UpdateAdminInstanceConfigurationHandler
        : IRequestHandler<UpdateAdminInstanceConfigurationCommand, AdminInstanceConfigurationDto> {
        private readonly IInstanceSettingsService _instanceSettingsService;

        public UpdateAdminInstanceConfigurationHandler(IInstanceSettingsService instanceSettingsService) =>
            _instanceSettingsService = instanceSettingsService;

        public async Task<AdminInstanceConfigurationDto> Handle(
            UpdateAdminInstanceConfigurationCommand request,
            CancellationToken cancellationToken) {
            if (string.IsNullOrWhiteSpace(request.PlatformName))
                throw new ArgumentException("PlatformName is required.");

            if (string.IsNullOrWhiteSpace(request.AdministratorEmail))
                throw new ArgumentException("AdministratorEmail is required.");

            if (!request.AdministratorEmail.Contains('@'))
                throw new ArgumentException("AdministratorEmail must be valid.");

            var settings = new InstanceSettings(
                request.PlatformName.Trim(),
                (request.Description ?? string.Empty).Trim(),
                request.AdministratorEmail.Trim());

            InstanceSettings updated = await _instanceSettingsService.UpdateAsync(settings, cancellationToken);

            return new AdminInstanceConfigurationDto(
                updated.PlatformName,
                updated.Description,
                updated.AdministratorEmail);
        }
    }
}