namespace Krea.Application.Features.DirectMessages.GetConversation;

using AutoMapper;
using Domain.Abstractions;
using Domain.Entities;
using Domain.Repositories;
using Dto;

internal class GetConversationQueryHandler(
    IConversationRepository conversationRepository,
    // IUserRepository userRepository,
    IMapper mapper)
    : IRequestHandler<GetConversationQuery, ConversationDto>
{
    public async Task<ConversationDto> Handle(GetConversationQuery request, CancellationToken cancellationToken)
    {
        Conversation? conversation = await conversationRepository.GetDirectMessageBetweenAsync(
            request.UserId, request.OtherUserId, cancellationToken);

        if (conversation == null)
            return new ConversationDto();

        // Get current participant
        ConversationParticipant currentParticipant = conversation.Participants.First(p => p.UserId == request.UserId);
        User otherParticipant = conversation.Participants.First(p => p.UserId != request.UserId).User;

        // Message pagination
        List<Message> messages = conversation.Messages
            .OrderByDescending(m => m.SentAt)
            .Skip(((request.Page ?? 1) - 1) * (request.PageSize ?? 20))
            .Take(request.PageSize ?? 20)
            .ToList();
        
        // Map Dto
        var messageDtos = mapper.Map<List<DirectMessageDto>>(messages);

        // Calculate IsRead
        foreach (DirectMessageDto msgDto in messageDtos)
        {
            if (msgDto.SenderId == request.UserId)
            {
                msgDto.IsRead = true; // Own messages
            }
            else
            {
                Message messageEntity = messages.First(m => m.Id == msgDto.Id);
                msgDto.IsRead = currentParticipant.IsMessageRead(messageEntity);
            }
        }
        

        string? avatarUrl = otherParticipant.ProfilePicture?.Path;
        
        // Create response Dto
        var dto = new ConversationDto
        {
            ConversationId = conversation.Id,
            OtherParticipantId = otherParticipant.Id,
            OtherParticipantName = otherParticipant.DisplayName,
            OtherParticipantAvatar = avatarUrl, 
            Messages = messageDtos
        };

        return dto;
    }
}