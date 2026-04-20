namespace Krea.Application.Features.Notifications.GetUnreadCount {
    using Domain.Abstractions;

    public sealed record GetUnreadCountQuery(Guid UserId) : IRequest<int>;
}