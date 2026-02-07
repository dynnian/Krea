using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Message {
        public Guid Id { get; private set; }

        public Guid UserId { get; private set; }
        public Guid ConversationId { get; private set; }

        public MessageContentType Content { get; private set; }

        public DateTime SentAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

#pragma warning disable CS8618
        private Message() { }
#pragma warning restore CS8618
        
        public Message(
            Guid userId,
            Guid conversationId,
            MessageContentType content
        ) {
            Validate(userId, conversationId);

            Id = Guid.NewGuid();
            UserId = userId;
            ConversationId = conversationId;
            Content = content;
            SentAt = DateTime.UtcNow;
            UpdatedAt = SentAt;
        }
        
        public static Message Load(
            Guid id,
            Guid userId,
            Guid conversationId,
            MessageContentType content,
            DateTime sentAt,
            DateTime updatedAt
        ) {
            Validate(userId, conversationId);

            return new Message {
                Id = id,
                UserId = userId,
                ConversationId = conversationId,
                Content = content,
                SentAt = sentAt,
                UpdatedAt = updatedAt
            };
        }

        public void Edit(MessageContentType newContent) {
            Content = newContent;
            UpdatedAt = DateTime.UtcNow;
        }

        private static void Validate(Guid userId, Guid conversationId) {
            if (userId == Guid.Empty)
                throw new ArgumentException("User is required.");

            if (conversationId == Guid.Empty)
                throw new ArgumentException("Conversation is required.");
        }
    }
}
