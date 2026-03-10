namespace Krea.Application.Features.DirectMessages.Dto {
    public class ConversationPreviewDto
    {
        public Guid ConversationId { get; set; }
        public Guid OtherParticipantId { get; set; }
        public string OtherParticipantName { get; set; } = string.Empty;
        public string? OtherParticipantAvatar { get; set; }
        public DirectMessageDto? LastMessage { get; set; }
        public DateTime LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
    }
}