namespace Krea.Domain.Entities;
using ValueObjects;

public sealed class Conversation
{
    public Guid Id { get; private set; }
    public ConversationType Type { get; private set; }

    public string? Title { get; private set; }
    public string? Description { get; private set; }
    public Media? Icon { get; private set; }

    private readonly List<ConversationParticipant> _participants = new();
    public IReadOnlyCollection<ConversationParticipant> Participants => _participants;

    private readonly List<Message> _messages = new();
    public IReadOnlyCollection<Message> Messages => _messages;

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    #pragma warning disable CS8618
    private Conversation() { }
    #pragma warning restore CS8618

    private Conversation(
        ConversationType type,
        string? title,
        string? description,
        Media? icon)
    {
        Validate(type, title, description);

        Id = Guid.NewGuid();
        Type = type;
        Title = title;
        Description = description;
        Icon = icon;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public static Conversation CreateDirectMessage()
        => new Conversation(ConversationType.DirectMessage, null, null, null);

    public static Conversation CreateGroup(
        string title,
        string? description,
        Media? icon = null)
        => new Conversation(ConversationType.Group, title, description, icon);

    public void AddParticipant(User user, ConversationRole role = ConversationRole.Member)
    {
        if (_participants.Any(p => p.UserId == user.Id))
            throw new InvalidOperationException("User already in conversation.");

        if (Type == ConversationType.DirectMessage && _participants.Count >= 2)
            throw new InvalidOperationException("Direct messages can only have 2 participants.");

        _participants.Add(new ConversationParticipant(user, this, role));

        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveParticipant(Guid userId)
    {
        var participant = _participants.FirstOrDefault(p => p.UserId == userId);

        if (participant is null)
            throw new InvalidOperationException("User is not part of this conversation.");

        if (Type == ConversationType.DirectMessage)
            throw new InvalidOperationException("Cannot remove participants from a DM.");

        if (participant.Role == ConversationRole.Admin &&
            _participants.Count(p => p.Role == ConversationRole.Admin && p.UserId != userId) == 0)
            throw new InvalidOperationException("Cannot remove the last admin.");

        participant.Leave();
        UpdatedAt = DateTime.UtcNow;
    }

    public Message SendTextMessage(User sender, string text)
    {
        EnsureParticipant(sender.Id);

        var message = Message.CreateTextMessage(sender, this, text);
        _messages.Add(message);

        IncrementUnreadForOthers(sender.Id);

        UpdatedAt = DateTime.UtcNow;
        return message;
    }

    private void EnsureParticipant(Guid userId)
    {
        if (!_participants.Any(p => p.UserId == userId && p.IsActive))
            throw new InvalidOperationException("User not active in conversation.");
    }

    private void IncrementUnreadForOthers(Guid senderId)
    {
        foreach (var p in _participants.Where(p => p.UserId != senderId && p.IsActive))
            p.IncrementUnread();
    }

    private static void Validate(
        ConversationType type,
        string? title,
        string? description)
    {
        if (type == ConversationType.Group)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Group title required.");

            if (title.Length > 32)
                throw new ArgumentException("Title max 32 characters.");

            if (!string.IsNullOrEmpty(description) && description.Length > 256)
                throw new ArgumentException("Description max 256 characters.");
        }

        if (type != ConversationType.DirectMessage) return;
        if (title != null || description != null)
            throw new ArgumentException("DM cannot have title or description.");
    }
}