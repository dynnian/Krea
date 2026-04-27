namespace Krea.Application.Features.Notifications.MarkAllNotificationsAsRead {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class MarkAllNotificationsAsReadHandler
        : IRequestHandler<MarkAllNotificationsAsReadCommand, Unit> {
        private readonly INotificationRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public MarkAllNotificationsAsReadHandler(
            INotificationRepository repository,
            IUnitOfWork unitOfWork) {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            MarkAllNotificationsAsReadCommand request,
            CancellationToken cancellationToken) {
            IReadOnlyList<Notification> unread =
                await _repository.GetUnreadByUserAsync(request.UserId, cancellationToken);

            foreach (Notification notification in unread)
                notification.MarkAsRead();

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}