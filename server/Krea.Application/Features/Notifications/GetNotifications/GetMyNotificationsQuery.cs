namespace Krea.Application.Features.Notifications.GetNotifications {
    using Domain.Abstractions;
    using Dto;

    public sealed record GetMyNotificationsQuery(Guid UserId, int Page, int PageSize)
        : IRequest<IReadOnlyList<NotificationDto>>;
}