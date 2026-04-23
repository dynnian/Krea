namespace Krea.Application.Features.DirectMessages.SendDirectMessage {
    using Abstractions.Identity;
    using AutoMapper;
    using Krea.Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Dto;

    internal class SendDirectMessageCommandHandler(
        IIdentityService identityService,
        IConversationRepository conversationRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
        : IRequestHandler<SendDirectMessageCommand, DirectMessageDto> {
        public async Task<DirectMessageDto> Handle(SendDirectMessageCommand request,
                                                   CancellationToken cancellationToken) {
            // Check both users exist
            User? sender = await userRepository.GetByIdAsync(request.SenderId, cancellationToken);
            User? receiver = await userRepository.GetByIdAsync(request.ReceiverId, cancellationToken);
            if (sender == null || receiver == null)
                throw new Exception("Sender or receiver not found.");

            UserIdentity? senderIdentity = await identityService.FindByIdAsync(sender.Id);
            if (senderIdentity == null)
                throw new Exception("Sender does not exist.");

            // Search direct message conversation
            Conversation? conversation = await conversationRepository.GetDirectMessageBetweenAsync(
                request.SenderId, request.ReceiverId, cancellationToken);

            if (conversation == null) {
                conversation = Conversation.CreateDirectMessage();
                conversation.AddParticipant(sender, ConversationRole.Member);
                conversation.AddParticipant(receiver, ConversationRole.Member);
                conversationRepository.Add(conversation);
            }

            Message message = conversation.SendTextMessage(sender, request.Content);

            await unitOfWork.SaveChangesAsync(cancellationToken);

            // DTO mapping
            var dto = mapper.Map<DirectMessageDto>(message);
            dto.SenderId = sender.Id;
            dto.SenderUsername = senderIdentity.UserName;
            dto.SenderDisplayName = sender.DisplayName;
            dto.ReceiverId = receiver.Id;
            dto.IsRead = false;

            return dto;
        }
    }
}