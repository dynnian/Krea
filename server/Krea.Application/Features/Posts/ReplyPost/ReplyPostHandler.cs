namespace Krea.Application.Features.Posts.ReplyPost {
    using Abstractions.Notification;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;

    public sealed class ReplyPostHandler
        : IRequestHandler<ReplyPostCommand, Guid> {
        private readonly IPostRepository _postRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public ReplyPostHandler(
            IPostRepository postRepository,
            INotificationService notificationService,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(
            ReplyPostCommand command,
            CancellationToken cancellationToken) {
            Post? original = await _postRepository.GetByIdAsync(
                command.ReplyToPostId,
                cancellationToken);

            if (original is null)
                throw new Exception("Post not found");

            var reply = new Post(
                command.AuthorId,
                PostType.Plain,
                command.Title,
                command.Content,
                false,
                true
            );

            reply.ReplyTo(command.ReplyToPostId);

            await _postRepository.AddAsync(reply, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _notificationService.NotifyAsync(
                recipientUserId: original.AuthorPostId,
                actorUserId: command.AuthorId,
                type: NotificationType.PostReplied,
                content: "Han respondido a tu publicacion.",
                entityId: original.Id,
                entityType: NotificationEntityType.Post,
                cancellationToken: cancellationToken);

            return reply.Id;
        }
    }
}