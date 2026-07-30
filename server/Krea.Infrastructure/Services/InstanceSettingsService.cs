namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Admin;
    using Configuration;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.Extensions.Options;

    public sealed class InstanceSettingsService : IInstanceSettingsService {
        private readonly IInstanceConfigurationRepository _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly InstanceSettingsOptions _defaults;

        public InstanceSettingsService(
            IInstanceConfigurationRepository repository,
            IUnitOfWork unitOfWork,
            IOptions<InstanceSettingsOptions> options) {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _defaults = options.Value;
        }

        public async Task<InstanceSettings> GetAsync(CancellationToken cancellationToken = default) {
            InstanceConfiguration? entity = await _repository.GetAsync(cancellationToken);
            if (entity is null) {
                entity = new InstanceConfiguration(
                    _defaults.PlatformName,
                    _defaults.Description,
                    _defaults.AdministratorEmail);

                await _repository.AddAsync(entity, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return new InstanceSettings(entity.PlatformName, entity.Description, entity.AdministratorEmail);
        }

        public async Task<InstanceSettings> UpdateAsync(
            InstanceSettings settings,
            CancellationToken cancellationToken = default) {
            InstanceConfiguration? entity = await _repository.GetAsync(cancellationToken);
            if (entity is null) {
                entity = new InstanceConfiguration(
                    settings.PlatformName,
                    settings.Description,
                    settings.AdministratorEmail);

                await _repository.AddAsync(entity, cancellationToken);
            }
            else {
                entity.Update(settings.PlatformName, settings.Description, settings.AdministratorEmail);
                await _repository.UpdateAsync(entity, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return settings;
        }
    }
}