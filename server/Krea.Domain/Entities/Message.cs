using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Message {
        public Guid Id { get; private set; }

        public Guid UserId { get; private set; }
        public User User { get; private set; }

        public Guid ConversationId { get; private set; }
        public Conversation Conversation { get; private set; }

        public MessageContentType ContentType { get; private set; }
        public string? TextContent { get; private set; }

        private readonly List<Media> _mediaAttachments = new();
        public IReadOnlyCollection<Media> MediaAttachments => _mediaAttachments;

        public DateTime SentAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private Message() { }
        #pragma warning restore CS8618

        private Message(User user, Conversation conversation, MessageContentType contentType) {
            Id = Guid.NewGuid();
            User = user ?? throw new ArgumentNullException(nameof(user));
            UserId = user.Id;
            Conversation = conversation ?? throw new ArgumentNullException(nameof(conversation));
            ConversationId = conversation.Id;
            ContentType = contentType;
            SentAt = DateTime.UtcNow;
            UpdatedAt = SentAt;
        }

        public static Message CreateTextMessage(User user, Conversation conversation, string text) {
            if (string.IsNullOrWhiteSpace(text))
                throw new ArgumentException("Text message cannot be empty.");

            var message = new Message(user, conversation, MessageContentType.Text) { TextContent = text };
            return message;
        }

        public static Message CreateMediaMessage(User user, Conversation conversation,
                                                 IEnumerable<Media> mediaAttachments) {
            if (mediaAttachments == null)
                throw new ArgumentNullException(nameof(mediaAttachments));

            List<Media> mediaList = mediaAttachments.ToList();
            if (mediaList.Count == 0)
                throw new ArgumentException("Media message must have at least one attachment.");

            var message = new Message(user, conversation, MessageContentType.Media);
            foreach (Media media in mediaList) {
                message._mediaAttachments.Add(media);
            }

            return message;
        }

        public static Message CreateSystemMessage(User user, Conversation conversation, string? text = null) {
            var message = new Message(user, conversation, MessageContentType.System);
            if (!string.IsNullOrWhiteSpace(text))
                message.TextContent = text;
            return message;
        }

        public static Message Load(
            Guid id,
            User user,
            Conversation conversation,
            MessageContentType contentType,
            string? textContent,
            DateTime sentAt,
            DateTime updatedAt,
            IEnumerable<Media>? mediaAttachments = null) {
            var message = new Message {
                Id = id,
                User = user,
                Conversation = conversation,
                ContentType = contentType,
                TextContent = textContent,
                SentAt = sentAt,
                UpdatedAt = updatedAt
            };
            if (mediaAttachments != null) {
                foreach (Media media in mediaAttachments)
                    message._mediaAttachments.Add(media);
            }

            return message;
        }

        public void EditText(string newText) {
            if (ContentType != MessageContentType.Text && ContentType != MessageContentType.System)
                throw new InvalidOperationException("Only text or system messages can be edited.");

            if (string.IsNullOrWhiteSpace(newText))
                throw new ArgumentException("Text cannot be empty.");

            TextContent = newText;
            UpdatedAt = DateTime.UtcNow;
        }

        public void AddMedia(Media media) {
            if (ContentType != MessageContentType.Media)
                throw new InvalidOperationException("Cannot add media to a non-media message.");

            _mediaAttachments.Add(media);
            UpdatedAt = DateTime.UtcNow;
        }
    }
}