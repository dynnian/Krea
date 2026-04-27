namespace Krea.Application.Features.Notifications.GetNotifications {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class GetMyNotificationsHandler
        : IRequestHandler<GetMyNotificationsQuery, IReadOnlyList<NotificationDto>> {
        private readonly INotificationRepository _repository;

        public GetMyNotificationsHandler(INotificationRepository repository) => _repository = repository;

        public async Task<IReadOnlyList<NotificationDto>> Handle(
            GetMyNotificationsQuery request,
            CancellationToken cancellationToken) {
            IReadOnlyList<Notification> notifications = await _repository.GetByUserAsync(
                request.UserId,
                request.Page,
                request.PageSize,
                cancellationToken);

            return notifications.Select(NotificationDto.FromDomain).ToList();
        }
    }
}