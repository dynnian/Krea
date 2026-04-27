namespace Krea.Application.Features.Notifications.Dto {
    public sealed class UpdateNotificationPreferencesRequest {
        public bool AllNotificationsPaused { get; init; }
        public IReadOnlyList<NotificationPreferenceUpdateItem> Preferences { get; init; } = [];
    }
}