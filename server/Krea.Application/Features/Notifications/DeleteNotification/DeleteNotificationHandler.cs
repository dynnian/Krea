namespace Krea.Application.Features.Notifications.DeleteNotification {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class DeleteNotificationHandler
        : IRequestHandler<DeleteNotificationCommand, Unit> {
        private readonly INotificationRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteNotificationHandler(
            INotificationRepository repository,
            IUnitOfWork unitOfWork) {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            DeleteNotificationCommand request,
            CancellationToken cancellationToken) {
            Notification? notification = await _repository.GetByIdAsync(request.NotificationId, cancellationToken);

            if (notification is null || notification.UserId != request.UserId)
                throw new InvalidOperationException("Notification not found.");

            await _repository.DeleteAsync(notification, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}