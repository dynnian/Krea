namespace Krea.Application.Features.Notifications.Dto {
    public sealed class NotificationPreferencesDto {
        public bool AllNotificationsPaused { get; init; }
        public IReadOnlyList<NotificationPreferenceItemDto> Preferences { get; init; } = [];
    }
}