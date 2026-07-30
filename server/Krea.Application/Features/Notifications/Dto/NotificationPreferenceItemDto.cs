namespace Krea.Application.Features.Notifications.Dto {
    using Domain.ValueObjects;

    public sealed class NotificationPreferenceItemDto {
        public NotificationType Type { get; init; }
        public bool InAppEnabled { get; init; }
        public bool EmailEnabled { get; init; }
        public bool IsPaused { get; init; }
    }
}