namespace Krea.Application.Features.DirectMessages.MarkMessageAsRead {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    internal class MarkMessageAsReadCommandHandler(
        IConversationRepository conversationRepository,
        IMessageRepository messageRepository,
        IUnitOfWork unitOfWork)
        : IRequestHandler<MarkMessageAsReadCommand, bool> {
        public async Task<bool> Handle(MarkMessageAsReadCommand request, CancellationToken cancellationToken) {
            Message? message = await messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
            if (message == null)
                return false;

            Conversation? conversation =
                await conversationRepository.GetByIdAsync(message.Conversation.Id, cancellationToken);
            ConversationParticipant? participant =
                conversation?.Participants.FirstOrDefault(p => p.UserId == request.UserId);
            if (participant == null)
                throw new UnauthorizedAccessException("User not in conversation.");

            participant.MarkAsRead(request.MessageId);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}