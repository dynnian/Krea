namespace Krea.Application.Features.DirectMessages.Dto {
    public class ConversationDto {
        public Guid ConversationId { get; set; }
        public Guid OtherParticipantId { get; set; }
        public string OtherParticipantName { get; set; } = string.Empty;
        public string? OtherParticipantAvatar { get; set; }
        public List<DirectMessageDto> Messages { get; set; } = new();
    }
}