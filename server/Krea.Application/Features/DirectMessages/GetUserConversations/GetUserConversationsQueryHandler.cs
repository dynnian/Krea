namespace Krea.Application.Features.DirectMessages.GetUserConversations {
    using AutoMapper;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    internal class GetUserConversationsQueryHandler(IConversationRepository conversationRepository, IMapper mapper)
        : IRequestHandler<GetUserConversationsQuery, List<ConversationPreviewDto>> {
        
        public async Task<List<ConversationPreviewDto>> Handle(GetUserConversationsQuery request, CancellationToken cancellationToken)
        {
            // Obtain all the conversations in which the user participates
            IEnumerable<Conversation> conversations = await conversationRepository.GetByUserIdAsync(request.UserId, cancellationToken);

            List<ConversationPreviewDto> result = (from conversation in conversations
            let currentParticipant = conversation.Participants.First(p => p.UserId == request.UserId)
            let otherParticipant = conversation.Participants.First(p => p.UserId != request.UserId).User
            let lastMessage = conversation.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault()
            select new ConversationPreviewDto {
                ConversationId = conversation.Id,
                OtherParticipantId = otherParticipant.Id,
                OtherParticipantName = otherParticipant.DisplayName,
                OtherParticipantAvatar = otherParticipant.ProfilePicture?.Path,
                LastMessage = lastMessage != null ? mapper.Map<DirectMessageDto>(lastMessage) : null,
                LastMessageAt = lastMessage?.SentAt ?? conversation.UpdatedAt,
                UnreadCount = currentParticipant.UnreadCount,
            }).ToList();

            return result;
        }
    }
}