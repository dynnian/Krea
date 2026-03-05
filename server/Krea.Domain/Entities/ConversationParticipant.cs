namespace Krea.Domain.Entities;
using ValueObjects;
public sealed class ConversationParticipant
{
    public Guid UserId { get; private set; }
    public User User { get; private set; }
    public Guid ConversationId { get; private set; }
    public Conversation Conversation { get; private set; }

    public ConversationRole Role { get; private set; }

    public DateTime JoinedAt { get; private set; }
    public DateTime? LeftAt { get; private set; }

    public bool IsMuted { get; private set; }

    public Guid? LastReadMessageId { get; private set; }
    public int UnreadCount { get; private set; }

    public bool IsActive => LeftAt is null;

    #pragma warning disable CS8618
    private ConversationParticipant() { }
    #pragma warning restore CS8618

    internal ConversationParticipant(User user, Conversation conversation, ConversationRole role)
    {
        if (user is null || conversation is null)
            throw new ArgumentException("Invalid identifiers.");

        UserId = user.Id;
        User = user;
        ConversationId = conversation.Id;
        Conversation = conversation;
        Role = role;
        JoinedAt = DateTime.UtcNow;
        UnreadCount = 0;
    }

    public void Leave()
    {
        if (LeftAt != null)
            throw new InvalidOperationException("User already left.");

        LeftAt = DateTime.UtcNow;
    }

    public void Promote() => Role = ConversationRole.Admin;
    public void Demote() => Role = ConversationRole.Member;

    public void Mute() => IsMuted = true;
    public void Unmute() => IsMuted = false;
    
    public bool IsMessageRead(Message message)
    {
        if (LastReadMessageId == null)
            return false;

        Message? lastReadMessage = Conversation.Messages.FirstOrDefault(m => m.Id == LastReadMessageId);
        if (lastReadMessage == null)
            return false;

        return message.SentAt <= lastReadMessage.SentAt;
    }
    
    public void MarkAsRead(Guid messageId)
    {
        LastReadMessageId = messageId;
        UnreadCount = 0;
    }

    internal void IncrementUnread() => UnreadCount++;
}