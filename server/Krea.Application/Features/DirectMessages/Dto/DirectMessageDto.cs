namespace Krea.Application.Features.DirectMessages.Dto;

public record DirectMessageDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderUsername { get; set; } = string.Empty;
    public string SenderDisplayName { get; set; } = string.Empty;
    public string? SenderAvatarUrl { get; set; }
    public Guid ReceiverId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
}