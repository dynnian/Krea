namespace Krea.Application.Abstractions.Admin {
    public interface IInstanceSettingsService {
        Task<InstanceSettings> GetAsync(CancellationToken cancellationToken = default);
        Task<InstanceSettings> UpdateAsync(InstanceSettings settings, CancellationToken cancellationToken = default);
    }

    public sealed record InstanceSettings(
        string PlatformName,
        string Description,
        string AdministratorEmail
    );
}