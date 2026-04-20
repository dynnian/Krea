namespace Krea.Application.Features.Notifications.UpdateReferences {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class UpdateNotificationPreferencesHandler
        : IRequestHandler<UpdateNotificationPreferencesCommand, Unit> {
        private readonly INotificationPreferenceRepository _preferences;
        private readonly INotificationGlobalPreferenceRepository _globalPreferences;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateNotificationPreferencesHandler(
            INotificationPreferenceRepository preferences,
            INotificationGlobalPreferenceRepository globalPreferences,
            IUnitOfWork unitOfWork) {
            _preferences = preferences;
            _globalPreferences = globalPreferences;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            UpdateNotificationPreferencesCommand request,
            CancellationToken cancellationToken) {
            var global = await _globalPreferences.GetByUserAsync(request.UserId, cancellationToken);

            if (global is null) {
                global = new NotificationGlobalPreference(request.UserId, request.AllNotificationsPaused);
                await _globalPreferences.AddAsync(global, cancellationToken);
            }
            else {
                global.SetPaused(request.AllNotificationsPaused);
            }

            foreach (var item in request.Preferences) {
                var existing = await _preferences.GetByUserAndTypeAsync(
                    request.UserId,
                    item.Type,
                    cancellationToken);

                if (existing is null) {
                    existing = new NotificationPreference(
                        request.UserId,
                        item.Type,
                        item.InAppEnabled,
                        item.EmailEnabled,
                        item.IsPaused);

                    await _preferences.AddAsync(existing, cancellationToken);
                }
                else {
                    existing.Update(item.InAppEnabled, item.EmailEnabled, item.IsPaused);
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}