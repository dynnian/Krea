namespace Krea.Application.Features.Follows {
    using Abstractions.Notification;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;

    public sealed class FollowUserHandler
        : IRequestHandler<FollowUserCommand, Unit> {
        private readonly IFollowRepository _followRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public FollowUserHandler(
            IFollowRepository followRepository,
            INotificationService notificationService,
            IUnitOfWork unitOfWork) {
            _followRepository = followRepository;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            FollowUserCommand command,
            CancellationToken cancellationToken) {
            if (command.SourceId == command.TargetId)
                throw new InvalidOperationException("User cannot follow himself.");

            bool alreadyFollowing = await _followRepository.ExistsAsync(
                command.SourceId,
                command.TargetId,
                cancellationToken);

            if (alreadyFollowing)
                return Unit.Value;

            var follow = new Follow(command.SourceId, command.TargetId);

            await _followRepository.AddAsync(follow, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _notificationService.NotifyAsync(
                command.TargetId,
                command.SourceId,
                NotificationType.Follow,
                "Tienes un nuevo seguidor.",
                command.SourceId,
                NotificationEntityType.User,
                cancellationToken);

            return Unit.Value;
        }
    }
}