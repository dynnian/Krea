namespace Krea.Application.Features.Notifications.MarkNotificationAsRead {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class MarkNotificationAsReadHandler
        : IRequestHandler<MarkNotificationAsReadCommand, Unit> {
        private readonly INotificationRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public MarkNotificationAsReadHandler(
            INotificationRepository repository,
            IUnitOfWork unitOfWork) {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            MarkNotificationAsReadCommand request,
            CancellationToken cancellationToken) {
            Notification? notification = await _repository.GetByIdAsync(request.NotificationId, cancellationToken);

            if (notification is null || notification.UserId != request.UserId)
                throw new InvalidOperationException("Notification not found.");

            notification.MarkAsRead();

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}