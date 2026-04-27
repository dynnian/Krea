namespace Krea.Application.Features.Notifications.GetPreferences {
    using Domain.Abstractions;
    using Dto;

    public sealed record GetNotificationPreferencesQuery(Guid UserId)
        : IRequest<NotificationPreferencesDto>;
}