namespace Krea.Application.Features.Posts.Like {
    using Abstractions.Notification;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;

    public sealed class LikePostHandler
        : IRequestHandler<LikePostCommand, Unit> {
        private readonly IPostRepository _postRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public LikePostHandler(
            IPostRepository postRepository,
            INotificationService notificationService,
            IUnitOfWork unitOfWork) {
            _postRepository = postRepository;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            LikePostCommand command,
            CancellationToken ct) {
            Post? post = await _postRepository.GetFullPostAsync(command.PostId, ct);

            if (post is null)
                throw new Exception("Post not found");

            post.AddLike(command.UserId);

            await _unitOfWork.SaveChangesAsync(ct);

            await _notificationService.NotifyAsync(
                post.AuthorPostId,
                command.UserId,
                NotificationType.PostLiked,
                "A alguien le gustó tu publicacion.",
                post.Id,
                NotificationEntityType.Post,
                ct);

            return Unit.Value;
        }
    }
}