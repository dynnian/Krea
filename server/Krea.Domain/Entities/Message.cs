using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Message {
        public Guid Id { get; private set; }

        public User User { get; private set; }
        public Conversation Conversation { get; private set; }

        public MessageContentType Content { get; private set; }

        public DateTime SentAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private Message() { }
        #pragma warning restore CS8618
        
        public Message(
            User user,
            Conversation conversation,
            MessageContentType content
        ) {
            Validate(user, conversation);

            Id = Guid.NewGuid();
            User = user;
            Conversation = conversation;
            Content = content;
            SentAt = DateTime.UtcNow;
            UpdatedAt = SentAt;
        }
        
        public static Message Load(
            Guid id,
            User user,
            Conversation conversation,
            MessageContentType content,
            DateTime sentAt,
            DateTime updatedAt
        ) {
            Validate(user, conversation);

            return new Message {
                Id = id,
                User = user,
                Conversation = conversation,
                Content = content,
                SentAt = sentAt,
                UpdatedAt = updatedAt
            };
        }

        public void Edit(MessageContentType newContent) {
            Content = newContent;
            UpdatedAt = DateTime.UtcNow;
        }

        private static void Validate(User user, Conversation conversation) {
            if (user is null)
                throw new ArgumentException("User is required.");

            if (conversation is null)
                throw new ArgumentException("Conversation is required.");
        }
    }
}
