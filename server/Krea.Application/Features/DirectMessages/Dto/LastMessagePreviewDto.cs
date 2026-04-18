namespace Krea.Application.Features.DirectMessages.Dto {
    public record LastMessagePreviewDto {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public string SenderDisplayName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
    }
}