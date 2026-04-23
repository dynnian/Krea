namespace Krea.Application.Features.DirectMessages.GetConversationMessages {
    using AutoMapper;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    internal class GetConversationMessagesQueryHandler(IConversationRepository conversationRepository, IMapper mapper)
        : IRequestHandler<GetConversationMessagesQuery, List<DirectMessageDto>> {
        public async Task<List<DirectMessageDto>> Handle(GetConversationMessagesQuery request,
                                                         CancellationToken cancellationToken) {
            Conversation? conversation =
                await conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken);
            if (conversation == null)
                throw new KeyNotFoundException($"Conversation {request.ConversationId} not found.");

            // Verify user is a participant
            if (conversation.Participants.All(p => p.UserId != request.UserId))
                throw new UnauthorizedAccessException("You are not authorized to access this conversation.");

            // Paginate messages
            List<Message> messages = conversation.Messages
                                                 .OrderByDescending(m => m.SentAt)
                                                 .Skip((request.Page - 1) * request.PageSize)
                                                 .Take(request.PageSize)
                                                 .ToList();

            // Map
            var dtos = mapper.Map<List<DirectMessageDto>>(messages);

            // Calculate IsRead for each message
            ConversationParticipant currentParticipant =
                conversation.Participants.First(p => p.UserId == request.UserId);
            for (int i = 0; i < messages.Count; i++) {
                Message message = messages[i];
                DirectMessageDto dto = dtos[i];

                dto.IsRead = dto.SenderId == request.UserId ||
                             currentParticipant.IsMessageRead(message);
            }

            return dtos;
        }
    }
}