namespace Krea.Application.Features.Notifications.UpdateReferences {
    using Domain.Abstractions;
    using Dto;

    public sealed record UpdateNotificationPreferencesCommand(
        Guid UserId,
        bool AllNotificationsPaused,
        IReadOnlyList<NotificationPreferenceUpdateItem> Preferences)
        : IRequest<Unit>;
}