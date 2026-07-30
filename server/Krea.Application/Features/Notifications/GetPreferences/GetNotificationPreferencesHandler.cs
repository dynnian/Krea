namespace Krea.Application.Features.Notifications.GetPreferences {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Dto;

    public sealed class GetNotificationPreferencesHandler
        : IRequestHandler<GetNotificationPreferencesQuery, NotificationPreferencesDto> {
        private readonly INotificationPreferenceRepository _preferences;
        private readonly INotificationGlobalPreferenceRepository _globalPreferences;

        public GetNotificationPreferencesHandler(
            INotificationPreferenceRepository preferences,
            INotificationGlobalPreferenceRepository globalPreferences) {
            _preferences = preferences;
            _globalPreferences = globalPreferences;
        }

        public async Task<NotificationPreferencesDto> Handle(
            GetNotificationPreferencesQuery request,
            CancellationToken cancellationToken) {
            NotificationGlobalPreference? global =
                await _globalPreferences.GetByUserAsync(request.UserId, cancellationToken);
            IReadOnlyList<NotificationPreference> prefs =
                await _preferences.GetByUserAsync(request.UserId, cancellationToken);

            NotificationType[] allTypes = Enum.GetValues<NotificationType>();

            List<NotificationPreferenceItemDto> completed = allTypes.Select(type => {
                NotificationPreference? existing = prefs.FirstOrDefault(x => x.Type == type);

                return new NotificationPreferenceItemDto {
                    Type = type,
                    InAppEnabled = existing?.InAppEnabled ?? true,
                    EmailEnabled = existing?.EmailEnabled ?? false,
                    IsPaused = existing?.IsPaused ?? false
                };
            }).ToList();

            return new NotificationPreferencesDto {
                AllNotificationsPaused = global?.AllNotificationsPaused ?? false,
                Preferences = completed
            };
        }
    }
}